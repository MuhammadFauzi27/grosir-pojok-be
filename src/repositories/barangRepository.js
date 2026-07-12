import pool from '../config/database.js';

/**
 * Ambil daftar barang dengan filter opsional & pagination.
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
    conditions.push(`nama_barang ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }
  if (kategori) {
    conditions.push(`kategori = $${idx++}`);
    values.push(kategori);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit, offset);

  const sql = `
    SELECT id_barang, nama_barang, kategori, harga_barang, created_at
    FROM barang
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
};

/**
 * Cari satu barang berdasarkan primary key.
 *
 * @param {number} id_barang
 * @returns {Promise<object|null>} Barang atau null jika tidak ditemukan
 */
export const findById = async (id_barang) => {
  const sql = `
    SELECT id_barang, nama_barang, kategori, harga_barang, created_at
    FROM barang
    WHERE id_barang = $1
  `;
  const { rows } = await pool.query(sql, [id_barang]);
  return rows[0] ?? null;
};

/**
 * Ambil detail barang beserta seluruh satuannya (BarangDetail).
 *
 * @param {number} id_barang
 * @returns {Promise<object|null>} BarangDetail atau null jika tidak ditemukan
 */
export const findByIdWithSatuan = async (id_barang) => {
  // Header barang
  const barangSql = `
    SELECT id_barang, nama_barang, kategori, harga_barang, created_at
    FROM barang
    WHERE id_barang = $1
  `;
  const { rows: barangRows } = await pool.query(barangSql, [id_barang]);
  if (barangRows.length === 0) return null;

  // Satuan milik barang ini
  const satuanSql = `
    SELECT id_satuan, id_barang, nama_satuan, created_at
    FROM satuan_barang
    WHERE id_barang = $1
    ORDER BY nama_satuan
  `;
  const { rows: satuanRows } = await pool.query(satuanSql, [id_barang]);

  // Stok barang ini
  const stokSql = `
    SELECT id_stok, jumlah_stok
    FROM stok
    WHERE id_barang = $1
  `;
  const { rows: stokRows } = await pool.query(stokSql, [id_barang]);

  return {
    ...barangRows[0],
    satuan: satuanRows,
    stok: stokRows[0] ?? null,
  };
};

/**
 * Insert barang baru.
 *
 * @param {object} param
 * @param {string} param.nama_barang
 * @param {string} param.kategori
 * @param {number} param.harga_barang
 * @returns {Promise<object>} Barang yang baru dibuat
 */
export const insert = async ({ nama_barang, kategori, harga_barang }) => {
  const sql = `
    INSERT INTO barang (nama_barang, kategori, harga_barang)
    VALUES ($1, $2, $3)
    RETURNING id_barang, nama_barang, kategori, harga_barang, created_at
  `;
  const { rows } = await pool.query(sql, [nama_barang, kategori, harga_barang]);
  return rows[0];
};

/**
 * Update data barang.
 *
 * @param {number} id_barang
 * @param {object} param
 * @param {string} param.nama_barang
 * @param {string} param.kategori
 * @param {number} param.harga_barang
 * @returns {Promise<object|null>} Barang setelah diperbarui, atau null jika tidak ditemukan
 */
export const update = async (id_barang, { nama_barang, kategori, harga_barang }) => {
  const sql = `
    UPDATE barang
    SET nama_barang  = COALESCE($1, nama_barang),
        kategori     = COALESCE($2, kategori),
        harga_barang = COALESCE($3, harga_barang)
    WHERE id_barang = $4
    RETURNING id_barang, nama_barang, kategori, harga_barang, created_at
  `;
  const { rows } = await pool.query(sql, [
    nama_barang  ?? null,
    kategori     ?? null,
    harga_barang ?? null,
    id_barang,
  ]);
  return rows[0] ?? null;
};

/**
 * Hapus barang berdasarkan id.
 * Jika barang masih memiliki satuan_barang atau stok terkait, DB akan melempar FK RESTRICT error.
 *
 * @param {number} id_barang
 * @returns {Promise<boolean>} true jika berhasil dihapus, false jika tidak ditemukan
 */
export const remove = async (id_barang) => {
  const sql = `DELETE FROM barang WHERE id_barang = $1 RETURNING id_barang`;
  const { rows } = await pool.query(sql, [id_barang]);
  return rows.length > 0;
};
