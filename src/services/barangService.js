import ResponseError from '../exceptions/responseError.js';
import * as barangRepository from '../repositories/barangRepository.js';

/**
 * Ambil daftar barang dengan filter opsional & pagination.
 *
 * @param {object} query — query params mentah dari req.query
 * @returns {Promise<object[]>} array Barang
 */
export const getAllBarang = async (query) => {
  const page  = Math.max(1, parseInt(query.page  ?? 1,  10));
  const limit = Math.max(1, parseInt(query.limit ?? 20, 10));
  const search   = query.search   ?? undefined;
  const kategori = query.kategori ?? undefined;

  return barangRepository.findAll({ search, kategori, page, limit });
};

/**
 * Ambil detail satu barang beserta seluruh satuannya dan stok.
 *
 * @param {number} id_barang
 * @returns {Promise<object>} BarangDetail
 * @throws {ResponseError} 404 jika barang tidak ditemukan
 */
export const getDetailBarang = async (id_barang) => {
  const data = await barangRepository.findByIdWithSatuan(id_barang);
  if (!data) {
    throw new ResponseError(404, `Barang dengan id_barang=${id_barang} tidak ditemukan`);
  }
  return data;
};

/**
 * Tambah barang baru.
 *
 * @param {object} param
 * @param {string} param.nama_barang
 * @param {string} param.kategori
 * @param {number} param.harga_barang
 * @returns {Promise<object>} Barang yang baru dibuat
 * @throws {ResponseError} 400 jika field wajib tidak lengkap
 */
export const tambahBarang = async ({ nama_barang, kategori, harga_barang }) => {
  return barangRepository.insert({ nama_barang, kategori, harga_barang });
};

/**
 * Perbarui data barang.
 * Field yang tidak dikirim dipertahankan nilainya (COALESCE).
 *
 * @param {number} id_barang
 * @param {object} param
 * @param {string|undefined} param.nama_barang
 * @param {string|undefined} param.kategori
 * @param {number|undefined} param.harga_barang
 * @returns {Promise<object>} Barang setelah diperbarui
 * @throws {ResponseError} 404 jika barang tidak ditemukan
 */
export const updateBarang = async (id_barang, { nama_barang, kategori, harga_barang }) => {
  const data = await barangRepository.update(id_barang, { nama_barang, kategori, harga_barang });
  if (!data) {
    throw new ResponseError(404, `Barang dengan id_barang=${id_barang} tidak ditemukan`);
  }
  return data;
};

/**
 * Hapus barang. Melempar 409 jika masih ada satuan_barang atau stok terkait (FK RESTRICT).
 *
 * @param {number} id_barang
 * @throws {ResponseError} 404 jika tidak ditemukan | 409 jika masih ada satuan terkait
 */
export const hapusBarang = async (id_barang) => {
  try {
    const deleted = await barangRepository.remove(id_barang);
    if (!deleted) {
      throw new ResponseError(404, `Barang dengan id_barang=${id_barang} tidak ditemukan`);
    }
  } catch (err) {
    // FK RESTRICT dari PostgreSQL: foreign_key_violation (code 23503)
    if (err.code === '23503') {
      throw new ResponseError(
        409,
        'Tidak dapat menghapus barang yang masih memiliki satuan_barang atau stok terkait'
      );
    }
    throw err;
  }
};
