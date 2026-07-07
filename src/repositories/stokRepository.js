import pool from '../config/database.js';

/**
 * Ambil daftar stok terkini dari view v_stok_barang.
 *
 * @param {object} filters
 * @param {string|undefined}  filters.search       — cari berdasarkan nama_barang atau nama_satuan (ILIKE)
 * @param {string|undefined}  filters.kategori     — filter exact kategori
 * @param {boolean}           filters.stok_menipis — jika true, hanya tampilkan stok <= ambang batas minimum
 * @param {number}            filters.stokMin       — ambang batas minimum stok_menipis (default 10)
 * @returns {Promise<object[]>} array StokBarang
 */
export const findAll = async ({ search, kategori, stok_menipis, stokMin = 10 }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(nama_barang ILIKE $${idx} OR nama_satuan ILIKE $${idx})`);
    idx++;
    values.push(`%${search}%`);
  }

  if (kategori) {
    conditions.push(`kategori = $${idx++}`);
    values.push(kategori);
  }

  // stok_menipis: tampilkan satuan dengan stok di bawah ambang batas minimum
  if (stok_menipis) {
    conditions.push(`stok_satuan <= $${idx++}`);
    values.push(stokMin);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      id_barang,
      nama_barang,
      kategori,
      id_satuan,
      nama_satuan,
      harga_satuan,
      stok_satuan
    FROM v_stok_barang
    ${whereClause}
    ORDER BY nama_barang, nama_satuan
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
};
