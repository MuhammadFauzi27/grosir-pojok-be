import pool from '../config/database.js';

/**
 * Ambil seluruh master satuan barang.
 *
 * @returns {Promise<object[]>} array SatuanBarang { id_satuan, nama_satuan }
 */
export const findAll = async () => {
  const sql = `
    SELECT id_satuan, nama_satuan
    FROM satuan_barang
    ORDER BY nama_satuan ASC
  `;
  const { rows } = await pool.query(sql);
  return rows;
};

/**
 * Cari satu satuan berdasarkan primary key.
 *
 * @param {number} id_satuan
 * @returns {Promise<object|null>} SatuanBarang atau null
 */
export const findById = async (id_satuan) => {
  const sql = `
    SELECT id_satuan, nama_satuan
    FROM satuan_barang
    WHERE id_satuan = $1
  `;
  const { rows } = await pool.query(sql, [id_satuan]);
  return rows[0] ?? null;
};

/**
 * Cari satu satuan berdasarkan nama (case-insensitive).
 *
 * @param {string} nama_satuan
 * @returns {Promise<object|null>} SatuanBarang atau null jika tidak ditemukan
 */
export const findByName = async (nama_satuan) => {
  const sql = `
    SELECT id_satuan, nama_satuan
    FROM satuan_barang
    WHERE LOWER(nama_satuan) = LOWER($1)
  `;
  const { rows } = await pool.query(sql, [nama_satuan]);
  return rows[0] ?? null;
};
