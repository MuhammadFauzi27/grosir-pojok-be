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
    const { username, password } = req.body;

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
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
