import ResponseError from '../exceptions/responseError.js';
import * as satuanBarangRepository from '../repositories/satuanBarangRepository.js';

/**
 * Ambil seluruh master satuan barang.
 *
 * @returns {Promise<object[]>} array { id_satuan, nama_satuan }
 */
export const getAllSatuan = async () => {
  return satuanBarangRepository.findAll();
};

/**
 * Cari satuan berdasarkan nama (case-insensitive).
 * Digunakan secara internal oleh barangService saat create barang.
 *
 * @param {string} nama_satuan
 * @returns {Promise<object>} SatuanBarang { id_satuan, nama_satuan }
 * @throws {ResponseError} 400 jika nama satuan tidak terdaftar di master
 */
export const getSatuanByName = async (nama_satuan) => {
  const satuan = await satuanBarangRepository.findByName(nama_satuan);
  if (!satuan) {
    throw new ResponseError(
      400,
      `Satuan '${nama_satuan}' tidak terdaftar. Gunakan salah satu satuan yang tersedia.`
    );
  }
  return satuan;
};
