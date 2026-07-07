import pool from '../config/database.js';

/**
 * Ambil daftar riwayat penjualan (summary) dengan filter & pagination.
 * Query langsung ke tabel penjualan JOIN pegawai, lalu hitung total_nota
 * dari detail_penjualan secara agregat.
 *
 * @param {object} filters
 * @param {number|undefined} filters.id_pegawai
 * @param {string|undefined} filters.tanggal_mulai  — format YYYY-MM-DD
 * @param {string|undefined} filters.tanggal_selesai — format YYYY-MM-DD
 * @param {number} filters.page   — 1-based
 * @param {number} filters.limit
 * @returns {Promise<object[]>} array PenjualanSummary
 */
export const findAll = async ({ id_pegawai, tanggal_mulai, tanggal_selesai, page, limit }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (id_pegawai) {
    conditions.push(`p.id_pegawai = $${idx++}`);
    values.push(id_pegawai);
  }
  if (tanggal_mulai) {
    conditions.push(`p.tanggal_jual >= $${idx++}`);
    values.push(tanggal_mulai);
  }
  if (tanggal_selesai) {
    // Inklusif sampai akhir hari
    conditions.push(`p.tanggal_jual < ($${idx++}::date + INTERVAL '1 day')`);
    values.push(tanggal_selesai);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  values.push(limit, offset);

  const sql = `
    SELECT
      p.no_nota_jual,
      p.tanggal_jual,
      p.id_pegawai,
      pg.nama                           AS nama_kasir,
      COALESCE(SUM(dp.subtotal_jual), 0) AS total_nota
    FROM penjualan p
    JOIN pegawai          pg ON pg.id_pegawai   = p.id_pegawai
    LEFT JOIN detail_penjualan dp ON dp.no_nota_jual = p.no_nota_jual
    ${whereClause}
    GROUP BY p.no_nota_jual, p.tanggal_jual, p.id_pegawai, pg.nama
    ORDER BY p.tanggal_jual DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
};

/**
 * Hitung jumlah transaksi pada tanggal tertentu (untuk generate no_nota_jual).
 *
 * @param {import('pg').PoolClient} client — pg client dalam transaksi
 * @param {string} dateStr — format YYYY-MM-DD
 * @returns {Promise<number>}
 */
export const countByDate = async (client, dateStr) => {
  const sql = `
    SELECT COUNT(*) AS total
    FROM penjualan
    WHERE tanggal_jual::date = $1::date
  `;
  const { rows } = await client.query(sql, [dateStr]);
  return parseInt(rows[0].total, 10);
};

/**
 * Ambil harga satuan saat ini (snapshot) untuk satu id_satuan.
 * Menggunakan SELECT … FOR UPDATE agar aman dalam transaksi.
 *
 * @param {import('pg').PoolClient} client
 * @param {number} id_satuan
 * @returns {Promise<{id_satuan: number, harga_satuan: number, stok_satuan: number}|null>}
 */
export const getSatuanHarga = async (client, id_satuan) => {
  const sql = `
    SELECT id_satuan, harga_satuan, stok_satuan
    FROM satuan_barang
    WHERE id_satuan = $1
    FOR UPDATE
  `;
  const { rows } = await client.query(sql, [id_satuan]);
  return rows[0] ?? null;
};

/**
 * Insert header penjualan.
 *
 * @param {import('pg').PoolClient} client
 * @param {object} param
 * @param {string} param.no_nota_jual
 * @param {number} param.id_pegawai
 * @returns {Promise<object>} baris penjualan yang baru dibuat
 */
export const insertHeader = async (client, { no_nota_jual, id_pegawai }) => {
  const sql = `
    INSERT INTO penjualan (no_nota_jual, id_pegawai)
    VALUES ($1, $2)
    RETURNING no_nota_jual, tanggal_jual, id_pegawai
  `;
  const { rows } = await client.query(sql, [no_nota_jual, id_pegawai]);
  return rows[0];
};

/**
 * Bulk-insert seluruh baris detail penjualan sekaligus.
 * subtotal_jual sudah dihitung di service layer.
 *
 * Trigger trg_potong_stok di DB akan otomatis terpanggil per baris
 * dan melempar EXCEPTION jika stok tidak mencukupi.
 *
 * @param {import('pg').PoolClient} client
 * @param {Array<{no_nota_jual: string, id_satuan: number, jumlah_jual: number, subtotal_jual: number}>} items
 * @returns {Promise<object[]>} baris detail yang berhasil diinsert
 */
export const insertDetailBulk = async (client, items) => {
  // Bangun VALUES ($1,$2,$3,$4), ($5,$6,$7,$8), ...
  const placeholders = items.map(
    (_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
  );
  const values = items.flatMap(({ no_nota_jual, id_satuan, jumlah_jual, subtotal_jual }) => [
    no_nota_jual,
    id_satuan,
    jumlah_jual,
    subtotal_jual,
  ]);

  const sql = `
    INSERT INTO detail_penjualan (no_nota_jual, id_satuan, jumlah_jual, subtotal_jual)
    VALUES ${placeholders.join(', ')}
    RETURNING id_detail_jual, no_nota_jual, id_satuan, jumlah_jual, subtotal_jual
  `;
  const { rows } = await client.query(sql, values);
  return rows;
};

/**
 * Ambil detail lengkap satu nota penjualan (header + semua item).
 * Mengembalikan null jika nota tidak ditemukan.
 *
 * @param {string} no_nota_jual
 * @returns {Promise<object|null>} PenjualanDetail atau null
 */
export const findByNota = async (no_nota_jual) => {
  // Query header
  const headerSql = `
    SELECT
      p.no_nota_jual,
      p.tanggal_jual,
      p.id_pegawai,
      pg.nama AS nama_kasir
    FROM penjualan p
    JOIN pegawai pg ON pg.id_pegawai = p.id_pegawai
    WHERE p.no_nota_jual = $1
  `;
  const { rows: headerRows } = await pool.query(headerSql, [no_nota_jual]);
  if (headerRows.length === 0) return null;

  // Query item detail
  const itemSql = `
    SELECT
      dp.id_detail_jual,
      dp.no_nota_jual,
      dp.id_satuan,
      b.nama_barang,
      s.nama_satuan,
      dp.jumlah_jual,
      dp.subtotal_jual
    FROM detail_penjualan dp
    JOIN satuan_barang s ON s.id_satuan  = dp.id_satuan
    JOIN barang        b ON b.id_barang  = s.id_barang
    WHERE dp.no_nota_jual = $1
    ORDER BY dp.id_detail_jual
  `;
  const { rows: itemRows } = await pool.query(itemSql, [no_nota_jual]);

  const total_nota = itemRows.reduce((sum, row) => sum + parseFloat(row.subtotal_jual), 0);

  return {
    ...headerRows[0],
    items: itemRows,
    total_nota,
  };
};
