import pool from '../config/database.js';

/**
 * Cari satu satuan barang berdasarkan primary key.
 *
 * @param {number} id_satuan
 * @returns {Promise<object|null>} SatuanBarang atau null
 */
export const findById = async (id_satuan) => {
  const sql = `
    SELECT id_satuan, id_barang, nama_satuan, harga_satuan, stok_satuan, created_at
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
    SELECT id_satuan, id_barang, nama_satuan, harga_satuan, stok_satuan, created_at
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
 * @param {number} param.harga_satuan
 * @param {number} param.stok_satuan
 * @returns {Promise<object>} SatuanBarang yang baru dibuat
 */
export const insert = async (id_barang, { nama_satuan, harga_satuan, stok_satuan }) => {
  const sql = `
    INSERT INTO satuan_barang (id_barang, nama_satuan, harga_satuan, stok_satuan)
    VALUES ($1, $2, $3, $4)
    RETURNING id_satuan, id_barang, nama_satuan, harga_satuan, stok_satuan, created_at
  `;
  const { rows } = await pool.query(sql, [id_barang, nama_satuan, harga_satuan, stok_satuan]);
  return rows[0];
};

/**
 * Update nama_satuan dan/atau harga_satuan.
 * Field yang tidak dikirim dipertahankan nilainya (COALESCE).
 *
 * @param {number} id_satuan
 * @param {object} param
 * @param {string|undefined} param.nama_satuan
 * @param {number|undefined} param.harga_satuan
 * @returns {Promise<object|null>} SatuanBarang setelah diperbarui, atau null
 */
export const update = async (id_satuan, { nama_satuan, harga_satuan }) => {
  const sql = `
    UPDATE satuan_barang
    SET
      nama_satuan  = COALESCE($1, nama_satuan),
      harga_satuan = COALESCE($2, harga_satuan)
    WHERE id_satuan = $3
    RETURNING id_satuan, id_barang, nama_satuan, harga_satuan, stok_satuan, created_at
  `;
  const { rows } = await pool.query(sql, [nama_satuan ?? null, harga_satuan ?? null, id_satuan]);
  return rows[0] ?? null;
};

/**
 * Penyesuaian stok manual (stock opname / barang masuk).
 * Menambahkan `perubahan` ke stok_satuan yang ada.
 *
 * @param {number} id_satuan
 * @param {number} perubahan — positif untuk tambah, negatif untuk kurangi
 * @returns {Promise<object|null>} SatuanBarang setelah disesuaikan, atau null
 */
export const adjustStok = async (id_satuan, perubahan) => {
  const sql = `
    UPDATE satuan_barang
    SET stok_satuan = stok_satuan + $1
    WHERE id_satuan = $2
    RETURNING id_satuan, id_barang, nama_satuan, harga_satuan, stok_satuan, created_at
  `;
  const { rows } = await pool.query(sql, [perubahan, id_satuan]);
  return rows[0] ?? null;
};

/**
 * Hapus satuan barang berdasarkan id.
 * Jika satuan sudah dipakai dalam transaksi, DB akan melempar FK RESTRICT error.
 *
 * @param {number} id_satuan
 * @returns {Promise<boolean>} true jika berhasil dihapus, false jika tidak ditemukan
 */
export const remove = async (id_satuan) => {
  const sql = `DELETE FROM satuan_barang WHERE id_satuan = $1 RETURNING id_satuan`;
  const { rows } = await pool.query(sql, [id_satuan]);
  return rows.length > 0;
};
