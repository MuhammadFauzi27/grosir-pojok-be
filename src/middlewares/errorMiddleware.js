import ResponseError from '../exceptions/responseError.js';

/**
 * Global error-handling middleware Express.
 * Menangkap semua error yang dilempar via next(err) dari controller/service/repository.
 */
const errorMiddleware = (err, req, res, next) => {
  console.error(`[errorMiddleware] ${err.status ?? 500} — ${err.message}`);

  if (!err) {
    return next();
  }

  if (err instanceof ResponseError) {
    return res.status(err.status).json({
      error  : httpStatusText(err.status),
      message: err.message,
    });
  }

  // Error tidak terduga (500 Internal Server Error)
  return res.status(500).json({
    error  : 'Internal Server Error',
    message: 'Terjadi kesalahan internal server',
  });
};

/**
 * Terjemahkan HTTP status code ke teks standar.
 * @param {number} status
 * @returns {string}
 */
const httpStatusText = (status) => {
  const map = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
  };
  return map[status] ?? 'Error';
};

export default {
  errorMiddleware,
  httpStatusText,
};
