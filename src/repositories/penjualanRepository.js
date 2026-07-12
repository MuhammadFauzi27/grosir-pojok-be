import pool from '../config/database.js';

/**
 * Ambil daftar riwayat penjualan (summary) dengan filter & pagination.
 * Query langsung ke tabel penjualan JOIN pegawai, lalu hitung total_nota
 * dari kolom total_jual yang sudah tersimpan.
 *
 * @param {object} filters
 * @param {string|undefined} filters.username        — filter berdasarkan username kasir
 * @param {string|undefined} filters.tanggal_mulai   — format YYYY-MM-DD
 * @param {string|undefined} filters.tanggal_selesai — format YYYY-MM-DD
 * @param {number} filters.page   — 1-based
 * @param {number} filters.limit
 * @returns {Promise<object[]>} array PenjualanSummary
 */
export const findAll = async ({ username, tanggal_mulai, tanggal_selesai, page, limit }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (username) {
    conditions.push(`p.username = $${idx++}`);
    values.push(username);
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
      p.no_nota,
      p.tanggal_jual,
      p.total_jual,
      p.username,
      pg.nama AS nama_kasir
    FROM penjualan p
    JOIN pegawai   pg ON pg.username = p.username
    ${whereClause}
    ORDER BY p.tanggal_jual DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
};

/**
 * Hitung jumlah transaksi pada tanggal tertentu (untuk generate no_nota).
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
 * Ambil harga barang saat ini (snapshot) untuk satu id_barang.
 * Menggunakan SELECT … FOR UPDATE agar aman dalam transaksi.
 *
 * @param {import('pg').PoolClient} client
 * @param {number} id_barang
 * @returns {Promise<{id_barang: number, harga_barang: number}|null>}
 */
export const getBarangHarga = async (client, id_barang) => {
  const sql = `
    SELECT id_barang, harga_barang
    FROM barang
    WHERE id_barang = $1
    FOR UPDATE
  `;
  const { rows } = await client.query(sql, [id_barang]);
  return rows[0] ?? null;
};

/**
 * Insert header penjualan.
 *
 * @param {import('pg').PoolClient} client
 * @param {object} param
 * @param {string} param.no_nota
 * @param {string} param.username
 * @param {number} param.total_jual
 * @returns {Promise<object>} baris penjualan yang baru dibuat
 */
export const insertHeader = async (client, { no_nota, username, total_jual }) => {
  const sql = `
    INSERT INTO penjualan (no_nota, username, total_jual)
    VALUES ($1, $2, $3)
    RETURNING no_nota, tanggal_jual, total_jual, username
  `;
  const { rows } = await client.query(sql, [no_nota, username, total_jual]);
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
 * @param {Array<{no_nota: string, id_barang: number, jumlah_per_barang: number, subtotal_jual: number}>} items
 * @returns {Promise<object[]>} baris detail yang berhasil diinsert
 */
export const insertDetailBulk = async (client, items) => {
  // Bangun VALUES ($1,$2,$3,$4), ($5,$6,$7,$8), ...
  const placeholders = items.map(
    (_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
  );
  const values = items.flatMap(({ no_nota, id_barang, jumlah_per_barang, subtotal_jual }) => [
    no_nota,
    id_barang,
    jumlah_per_barang,
    subtotal_jual,
  ]);

  const sql = `
    INSERT INTO detail_penjualan (no_nota, id_barang, jumlah_per_barang, subtotal_jual)
    VALUES ${placeholders.join(', ')}
    RETURNING id_detail_jual, no_nota, id_barang, jumlah_per_barang, subtotal_jual
  `;
  const { rows } = await client.query(sql, values);
  return rows;
};

/**
 * Ambil detail lengkap satu nota penjualan (header + semua item).
 * Mengembalikan null jika nota tidak ditemukan.
 *
 * @param {string} no_nota
 * @returns {Promise<object|null>} PenjualanDetail atau null
 */
export const findByNota = async (no_nota) => {
  // Query header
  const headerSql = `
    SELECT
      p.no_nota,
      p.tanggal_jual,
      p.total_jual,
      p.username,
      pg.nama AS nama_kasir
    FROM penjualan p
    JOIN pegawai pg ON pg.username = p.username
    WHERE p.no_nota = $1
  `;
  const { rows: headerRows } = await pool.query(headerSql, [no_nota]);
  if (headerRows.length === 0) return null;

  // Query item detail
  const itemSql = `
    SELECT
      dp.id_detail_jual,
      dp.no_nota,
      dp.id_barang,
      b.nama_barang,
      dp.jumlah_per_barang,
      dp.subtotal_jual
    FROM detail_penjualan dp
    JOIN barang b ON b.id_barang = dp.id_barang
    WHERE dp.no_nota = $1
    ORDER BY dp.id_detail_jual
  `;
  const { rows: itemRows } = await pool.query(itemSql, [no_nota]);

  return {
    ...headerRows[0],
    items: itemRows,
  };
};
