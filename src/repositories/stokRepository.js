import pool from '../config/database.js';

/**
 * Ambil daftar stok terkini dari view v_stok_barang.
 *
 * @param {object} filters
 * @param {string|undefined}  filters.search       — cari berdasarkan nama_barang (ILIKE)
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
    conditions.push(`nama_barang ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }

  if (kategori) {
    conditions.push(`kategori = $${idx++}`);
    values.push(kategori);
  }

  // stok_menipis: tampilkan barang dengan stok di bawah ambang batas minimum
  if (stok_menipis) {
    conditions.push(`jumlah_stok <= $${idx++}`);
    values.push(stokMin);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      id_barang,
      nama_barang,
      kategori,
      harga_barang,
      id_stok,
      jumlah_stok
    FROM v_stok_barang
    ${whereClause}
    ORDER BY nama_barang
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
};

/**
 * Ambil stok satu barang berdasarkan id_barang.
 *
 * @param {number} id_barang
 * @returns {Promise<object|null>} baris stok atau null
 */
export const findByBarang = async (id_barang) => {
  const sql = `
    SELECT id_stok, id_barang, jumlah_stok
    FROM stok
    WHERE id_barang = $1
  `;
  const { rows } = await pool.query(sql, [id_barang]);
  return rows[0] ?? null;
};

/**
 * Ambil stok satu barang (FOR UPDATE) — untuk digunakan dalam transaksi DB.
 *
 * @param {import('pg').PoolClient} client
 * @param {number} id_barang
 * @returns {Promise<{id_stok: number, id_barang: number, jumlah_stok: number}|null>}
 */
export const findByBarangForUpdate = async (client, id_barang) => {
  const sql = `
    SELECT id_stok, id_barang, jumlah_stok
    FROM stok
    WHERE id_barang = $1
    FOR UPDATE
  `;
  const { rows } = await client.query(sql, [id_barang]);
  return rows[0] ?? null;
};

/**
 * Insert baris stok baru untuk sebuah barang.
 *
 * @param {number} id_barang
 * @param {number} jumlah_stok
 * @returns {Promise<object>} baris stok yang baru dibuat
 */
export const insert = async (id_barang, jumlah_stok = 0) => {
  const sql = `
    INSERT INTO stok (id_barang, jumlah_stok)
    VALUES ($1, $2)
    RETURNING id_stok, id_barang, jumlah_stok
  `;
  const { rows } = await pool.query(sql, [id_barang, jumlah_stok]);
  return rows[0];
};

/**
 * Penyesuaian stok manual (stock opname / barang masuk).
 * Menambahkan `perubahan` ke jumlah_stok yang ada.
 *
 * @param {number} id_barang  — barang yang stoknya disesuaikan
 * @param {number} perubahan  — positif untuk tambah, negatif untuk kurangi
 * @returns {Promise<object|null>} baris stok setelah disesuaikan, atau null jika tidak ditemukan
 */
export const adjustStok = async (id_barang, perubahan) => {
  const sql = `
    UPDATE stok
    SET jumlah_stok = jumlah_stok + $1
    WHERE id_barang = $2
    RETURNING id_stok, id_barang, jumlah_stok
  `;
  const { rows } = await pool.query(sql, [perubahan, id_barang]);
  return rows[0] ?? null;
};
