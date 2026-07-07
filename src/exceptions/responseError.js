/**
 * Custom error class untuk response HTTP yang terstruktur.
 * Digunakan bersama errorMiddleware untuk mengembalikan status code
 * dan pesan error yang konsisten ke client.
 *
 * @param {number} status  — HTTP status code (400, 401, 403, 404, 409, dst.)
 * @param {string} message — Pesan error yang dikirim ke client
 */
class ResponseError extends Error {
  constructor(status, message) {
    super(message);
    this.status  = status;   // HTTP status code
    this.message = message;  // pesan error
  }
}

export default ResponseError;