import jwtUtil from '../utils/jwt.js';

/**
 * Middleware autentikasi JWT.
 * Membaca Authorization header (Bearer token), memverifikasi token,
 * dan menyimpan payload (id_pegawai, role) ke req.user.
 */
const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      error  : 'Unauthorized',
      message: 'Token tidak ditemukan atau format tidak valid',
    });
  }

  const token = authorization.split(' ')[1];
  try {
    req.user = jwtUtil.verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({
      error  : 'Unauthorized',
      message: 'Token tidak valid atau sudah kedaluwarsa',
    });
  }
};

export default authMiddleware;