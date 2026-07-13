import * as authService from '../services/authService.js';
import ResponseError from '../exceptions/responseError.js';

// ─── POST /auth/login ──────────────────────────────────────────────────────────
/**
 * Handler login pengguna (Kasir / Gudang).
 * Memvalidasi input request, mendelegasikan logika ke authService,
 * lalu mengembalikan token + data pegawai ke client.
 *
 * Request body (JSON):
 *   { username: string, password: string }
 *
 * Response 200:
 *   { token: string, pegawai: Pegawai }
 *
 * Response 401:
 *   { error: 'Unauthorized', message: string }
 */
export const login = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // ── Validasi keberadaan field wajib ──
    if (!username || typeof username !== 'string' || username.trim() === '') {
      throw new ResponseError(400, 'username wajib diisi');
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new ResponseError(400, 'password wajib diisi');
    }

    const result = await authService.login({
      username: username.trim(),
      password,
      role
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/logout ─────────────────────────────────────────────────────────
/**
 * Handler logout pengguna.
 * Mengakhiri sesi pengguna. Karena JWT stateless dan belum ada mekanisme blacklist token
 * di level backend (Redis/DB), endpoint ini cukup memvalidasi request dan merespon 204
 * untuk menginstruksikan client agar menghapus token di sisi mereka.
 *
 * Response 204:
 *   Tidak ada konten
 *
 * Response 401:
 *   { error: 'Unauthorized', message: string }
 */
export const logout = async (req, res, next) => {
  try {
    // Di sistem stateless murni, cukup minta client hapus token dengan respon 204.
    // authMiddleware memastikan hanya user yang memiliki token valid yang bisa hit ini.
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
