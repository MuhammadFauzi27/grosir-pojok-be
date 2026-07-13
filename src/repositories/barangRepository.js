import pool from '../config/database.js';

/**
 * Ambil daftar barang dengan filter opsional & pagination.
 * Menyertakan nama_satuan (JOIN satuan_barang) dan jumlah_stok (JOIN stok).
 *
 * @param {object} filters
 * @param {string|undefined}  filters.search   — cari berdasarkan nama_barang (ILIKE)
 * @param {string|undefined}  filters.kategori — filter exact kategori
 * @param {number}            filters.page     — 1-based
 * @param {number}            filters.limit
 * @returns {Promise<object[]>} array Barang
 */
export const findAll = async ({ search, kategori, page, limit }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`b.nama_barang ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }
  if (kategori) {
    conditions.push(`b.kategori = $${idx++}`);
    values.push(kategori);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit, offset);

  const sql = `
    SELECT
      b.id_barang,
      b.nama_barang,
      b.kategori,
      b.harga_barang,
      b.id_satuan,
      s.nama_satuan,
      COALESCE(st.jumlah_stok, 0) AS jumlah_stok,
      b.created_at
    FROM barang b
    JOIN satuan_barang s ON b.id_satuan = s.id_satuan
    LEFT JOIN stok st ON b.id_barang = st.id_barang
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
};

/**
 * Cari satu barang berdasarkan primary key.
 * Menyertakan nama_satuan dan jumlah_stok.
 *
 * @param {number} id_barang
 * @returns {Promise<object|null>} Barang atau null jika tidak ditemukan
 */
export const findById = async (id_barang) => {
  const sql = `
    SELECT
      b.id_barang,
      b.nama_barang,
      b.kategori,
      b.harga_barang,
      b.id_satuan,
      s.nama_satuan,
      COALESCE(st.jumlah_stok, 0) AS jumlah_stok,
      b.created_at
    FROM barang b
    JOIN satuan_barang s ON b.id_satuan = s.id_satuan
    LEFT JOIN stok st ON b.id_barang = st.id_barang
    WHERE b.id_barang = $1
  `;
  const { rows } = await pool.query(sql, [id_barang]);
  return rows[0] ?? null;
};

/**
 * Ambil seluruh nilai kategori yang unik dari tabel barang.
 *
 * @returns {Promise<string[]>} array nama kategori unik, terurut abjad
 */
export const findAllKategori = async () => {
  const sql = `
    SELECT DISTINCT kategori
    FROM barang
    ORDER BY kategori ASC
  `;
  const { rows } = await pool.query(sql);
  return rows.map((r) => r.kategori);
};

/**
 * Insert barang baru sekaligus membuat baris stok awal.
 * Dijalankan dalam satu transaksi DB agar atomik.
 *
 * @param {object} param
 * @param {string} param.nama_barang
 * @param {string} param.kategori
 * @param {number} param.harga_barang
 * @param {number} param.id_satuan
 * @param {number} param.jumlah_stok
 * @returns {Promise<object>} Barang lengkap (termasuk nama_satuan & jumlah_stok)
 */
export const insert = async ({ nama_barang, kategori, harga_barang, id_satuan, jumlah_stok }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const barangSql = `
      INSERT INTO barang (nama_barang, kategori, harga_barang, id_satuan)
      VALUES ($1, $2, $3, $4)
      RETURNING id_barang, nama_barang, kategori, harga_barang, id_satuan, created_at
    `;
    const { rows: barangRows } = await client.query(barangSql, [
      nama_barang,
      kategori,
      harga_barang,
      id_satuan,
    ]);
    const barang = barangRows[0];

    const stokSql = `
      INSERT INTO stok (id_barang, jumlah_stok)
      VALUES ($1, $2)
      RETURNING jumlah_stok
    `;
    const { rows: stokRows } = await client.query(stokSql, [barang.id_barang, jumlah_stok]);

    await client.query('COMMIT');

    return {
      ...barang,
      jumlah_stok: stokRows[0].jumlah_stok,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update data barang.
 * Field yang tidak dikirim dipertahankan nilainya (COALESCE).
 * nama_satuan tidak dapat diubah melalui update.
 *
 * @param {number} id_barang
 * @param {object} param
 * @param {string|undefined} param.nama_barang
 * @param {string|undefined} param.kategori
 * @param {number|undefined} param.harga_barang
 * @returns {Promise<object|null>} Barang setelah diperbarui, atau null jika tidak ditemukan
 */
export const update = async (id_barang, { nama_barang, kategori, harga_barang }) => {
  const sql = `
    UPDATE barang
    SET nama_barang  = COALESCE($1, nama_barang),
        kategori     = COALESCE($2, kategori),
        harga_barang = COALESCE($3, harga_barang)
    WHERE id_barang = $4
    RETURNING id_barang, nama_barang, kategori, harga_barang, id_satuan, created_at
  `;
  const { rows } = await pool.query(sql, [
    nama_barang  ?? null,
    kategori     ?? null,
    harga_barang ?? null,
    id_barang,
  ]);
  if (!rows[0]) return null;

  // Ambil kembali dengan JOIN agar nama_satuan & jumlah_stok ikut ter-return
  return findById(id_barang);
};

/**
 * Hapus barang berdasarkan id.
 * Tabel stok terhubung dengan ON DELETE CASCADE, jadi baris stok ikut terhapus.
 *
 * @param {number} id_barang
 * @returns {Promise<boolean>} true jika berhasil dihapus, false jika tidak ditemukan
 */
export const remove = async (id_barang) => {
  const sql = `DELETE FROM barang WHERE id_barang = $1 RETURNING id_barang`;
  const { rows } = await pool.query(sql, [id_barang]);
  return rows.length > 0;
};
