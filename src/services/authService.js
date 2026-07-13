import ResponseError from '../exceptions/responseError.js';
import * as authRepository from '../repositories/authRepository.js';
import jwtUtil from '../utils/jwt.js';

/**
 * Proses login pegawai:
 *  1. Cari pegawai berdasarkan username di database
 *  2. Validasi bahwa pegawai ditemukan (401 jika tidak ada)
 *  3. Bandingkan password plain-text langsung dengan password di DB (401 jika salah)
 *  4. Generate JWT token dengan payload { id_pegawai, role }
 *  5. Kembalikan token + data pegawai (tanpa password)
 *
 * @param {object} payload
 * @param {string} payload.username  — username pegawai
 * @param {string} payload.password  — password plain-text (dikirim via HTTPS)
 * @returns {Promise<{ token: string, pegawai: object }>}
 * @throws {ResponseError} 401 jika username tidak ditemukan atau password salah
 */
export const login = async ({ username, password , role}) => {
  // — Cari pegawai di database —
  const pegawai = await authRepository.findByUsername(username);

  // — Tolak dengan pesan generik agar tidak bocorkan info username valid/tidak —
  if (!pegawai) {
    throw new ResponseError(401, 'Username atau password salah');
  }

  // — Verifikasi password secara langsung (plain string) —
  if (password !== pegawai.password || role !== pegawai.role) {
    throw new ResponseError(401, 'Username atau password salah');
  }

  // — Generate JWT: payload memuat id_pegawai & role untuk otorisasi —
  const token = jwtUtil.signToken({
    id_pegawai: pegawai.id_pegawai,
    role: pegawai.role,
  });

  // — Buang field password sebelum dikirim ke client —
  const { password: _omit, ...pegawaiSafe } = pegawai;

  return { token, pegawai: pegawaiSafe };
};
