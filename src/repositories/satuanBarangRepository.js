import pool from '../config/database.js';

/**
 * Cari satu satuan barang berdasarkan primary key.
 *
 * @param {number} id_satuan
 * @returns {Promise<object|null>} SatuanBarang atau null
 */
export const findById = async (id_satuan) => {
  const sql = `
    SELECT id_satuan, id_barang, nama_satuan, created_at
    FROM satuan_barang
    WHERE id_satuan = $1
  `;
  const { rows } = await pool.query(sql, [id_satuan]);
  return rows[0] ?? null;
};

/**
 * Ambil seluruh satuan milik satu barang.
 *
 * @param {number} id_barang
 * @returns {Promise<object[]>} array SatuanBarang
 */
export const findByBarang = async (id_barang) => {
  const sql = `
    SELECT id_satuan, id_barang, nama_satuan, created_at
    FROM satuan_barang
    WHERE id_barang = $1
    ORDER BY nama_satuan
  `;
  const { rows } = await pool.query(sql, [id_barang]);
  return rows;
};

/**
 * Insert satuan barang baru untuk sebuah barang.
 *
 * @param {number} id_barang
 * @param {object} param
 * @param {string} param.nama_satuan
 * @returns {Promise<object>} SatuanBarang yang baru dibuat
 */
export const insert = async (id_barang, { nama_satuan }) => {
  const sql = `
    INSERT INTO satuan_barang (id_barang, nama_satuan)
    VALUES ($1, $2)
    RETURNING id_satuan, id_barang, nama_satuan, created_at
  `;
  const { rows } = await pool.query(sql, [id_barang, nama_satuan]);
  return rows[0];
};

/**
 * Update nama_satuan.
 *
 * @param {number} id_satuan
 * @param {object} param
 * @param {string} param.nama_satuan
 * @returns {Promise<object|null>} SatuanBarang setelah diperbarui, atau null
 */
export const update = async (id_satuan, { nama_satuan }) => {
  const sql = `
    UPDATE satuan_barang
    SET nama_satuan = COALESCE($1, nama_satuan)
    WHERE id_satuan = $2
    RETURNING id_satuan, id_barang, nama_satuan, created_at
  `;
  const { rows } = await pool.query(sql, [nama_satuan ?? null, id_satuan]);
  return rows[0] ?? null;
};

/**
 * Hapus satuan barang berdasarkan id.
 * Jika satuan masih dipakai dalam view atau logika lain, DB akan melempar FK error.
 *
 * @param {number} id_satuan
 * @returns {Promise<boolean>} true jika berhasil dihapus, false jika tidak ditemukan
 */
export const remove = async (id_satuan) => {
  const sql = `DELETE FROM satuan_barang WHERE id_satuan = $1 RETURNING id_satuan`;
  const { rows } = await pool.query(sql, [id_satuan]);
  return rows.length > 0;
};
