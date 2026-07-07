import pool from '../config/database.js';

/**
 * Cari satu pegawai berdasarkan username.
 * Digunakan pada proses login untuk mengambil data pegawai beserta
 * password hash-nya guna verifikasi kredensial.
 *
 * @param {string} username
 * @returns {Promise<{id_pegawai: number, nama: string, username: string, password: string, role: string, created_at: Date}|null>}
 */
export const findByUsername = async (username) => {
  const sql = `
    SELECT id_pegawai, nama, username, password, role, created_at
    FROM pegawai
    WHERE username = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(sql, [username]);
  return rows[0] ?? null;
};
