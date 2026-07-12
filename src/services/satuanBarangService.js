import ResponseError from '../exceptions/responseError.js';
import * as barangRepository from '../repositories/barangRepository.js';
import * as satuanBarangRepository from '../repositories/satuanBarangRepository.js';

/**
 * Ambil seluruh satuan milik satu barang.
 * Memvalidasi bahwa barang induknya ada terlebih dahulu.
 *
 * @param {number} id_barang
 * @returns {Promise<object[]>} array SatuanBarang
 * @throws {ResponseError} 404 jika barang tidak ditemukan
 */
export const getSatuanByBarang = async (id_barang) => {
  const barang = await barangRepository.findById(id_barang);
  if (!barang) {
    throw new ResponseError(404, `Barang dengan id_barang=${id_barang} tidak ditemukan`);
  }
  return satuanBarangRepository.findByBarang(id_barang);
};

/**
 * Ambil detail satu satuan barang.
 *
 * @param {number} id_satuan
 * @returns {Promise<object>} SatuanBarang
 * @throws {ResponseError} 404 jika satuan tidak ditemukan
 */
export const getDetailSatuan = async (id_satuan) => {
  const data = await satuanBarangRepository.findById(id_satuan);
  if (!data) {
    throw new ResponseError(404, `Satuan dengan id_satuan=${id_satuan} tidak ditemukan`);
  }
  return data;
};

/**
 * Tambah satuan baru untuk sebuah barang.
 * Memvalidasi bahwa barang induknya ada terlebih dahulu.
 * Satuan hanya menyimpan nama kemasan (harga & stok ada di tabel masing-masing).
 *
 * @param {number} id_barang
 * @param {object} param
 * @param {string} param.nama_satuan
 * @returns {Promise<object>} SatuanBarang yang baru dibuat
 * @throws {ResponseError} 404 barang tidak ada | 409 nama satuan duplikat per barang
 */
export const tambahSatuan = async (id_barang, { nama_satuan }) => {
  const barang = await barangRepository.findById(id_barang);
  if (!barang) {
    throw new ResponseError(404, `Barang dengan id_barang=${id_barang} tidak ditemukan`);
  }

  try {
    return await satuanBarangRepository.insert(id_barang, { nama_satuan });
  } catch (err) {
    // Unique constraint uq_satuan_per_barang: unique_violation (code 23505)
    if (err.code === '23505') {
      throw new ResponseError(
        409,
        `Nama satuan '${nama_satuan}' sudah ada untuk barang ini`
      );
    }
    throw err;
  }
};

/**
 * Perbarui nama satuan.
 *
 * @param {number} id_satuan
 * @param {object} param
 * @param {string} param.nama_satuan
 * @returns {Promise<object>} SatuanBarang setelah diperbarui
 * @throws {ResponseError} 404 jika satuan tidak ditemukan
 */
export const updateSatuan = async (id_satuan, { nama_satuan }) => {
  const data = await satuanBarangRepository.update(id_satuan, { nama_satuan });
  if (!data) {
    throw new ResponseError(404, `Satuan dengan id_satuan=${id_satuan} tidak ditemukan`);
  }
  return data;
};

/**
 * Hapus satuan barang.
 *
 * @param {number} id_satuan
 * @throws {ResponseError} 404 tidak ditemukan
 */
export const hapusSatuan = async (id_satuan) => {
  const deleted = await satuanBarangRepository.remove(id_satuan);
  if (!deleted) {
    throw new ResponseError(404, `Satuan dengan id_satuan=${id_satuan} tidak ditemukan`);
  }
};
