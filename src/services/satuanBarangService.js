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
 *
 * @param {number} id_barang
 * @param {object} param
 * @param {string} param.nama_satuan
 * @param {number} param.harga_satuan
 * @param {number} param.stok_satuan
 * @returns {Promise<object>} SatuanBarang yang baru dibuat
 * @throws {ResponseError} 404 barang tidak ada | 409 nama satuan duplikat per barang
 */
export const tambahSatuan = async (id_barang, { nama_satuan, harga_satuan, stok_satuan }) => {
  const barang = await barangRepository.findById(id_barang);
  if (!barang) {
    throw new ResponseError(404, `Barang dengan id_barang=${id_barang} tidak ditemukan`);
  }

  try {
    return await satuanBarangRepository.insert(id_barang, { nama_satuan, harga_satuan, stok_satuan });
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
 * Perbarui nama_satuan dan/atau harga_satuan.
 * Bukan untuk penyesuaian stok — gunakan penyesuaianStok() untuk itu.
 *
 * @param {number} id_satuan
 * @param {object} param
 * @param {string|undefined} param.nama_satuan
 * @param {number|undefined} param.harga_satuan
 * @returns {Promise<object>} SatuanBarang setelah diperbarui
 * @throws {ResponseError} 404 jika satuan tidak ditemukan
 */
export const updateSatuan = async (id_satuan, { nama_satuan, harga_satuan }) => {
  const data = await satuanBarangRepository.update(id_satuan, { nama_satuan, harga_satuan });
  if (!data) {
    throw new ResponseError(404, `Satuan dengan id_satuan=${id_satuan} tidak ditemukan`);
  }
  return data;
};

/**
 * Penyesuaian stok manual (stock opname / barang masuk).
 * Menolak jika hasil stok akan menjadi negatif (CHECK stok_satuan >= 0).
 *
 * @param {number} id_satuan
 * @param {number} perubahan — positif untuk tambah, negatif untuk kurangi
 * @param {string|undefined} catatan — opsional, dicatat di log (untuk ekstensibilitas)
 * @returns {Promise<object>} SatuanBarang setelah disesuaikan
 * @throws {ResponseError} 404 tidak ditemukan | 400 stok jadi negatif
 */
export const penyesuaianStok = async (id_satuan, perubahan, catatan) => {
  // Pastikan satuan ada & cek stok saat ini
  const satuan = await satuanBarangRepository.findById(id_satuan);
  if (!satuan) {
    throw new ResponseError(404, `Satuan dengan id_satuan=${id_satuan} tidak ditemukan`);
  }

  const stokBaru = satuan.stok_satuan + perubahan;
  if (stokBaru < 0) {
    throw new ResponseError(
      400,
      `Penyesuaian stok gagal: stok saat ini ${satuan.stok_satuan}, perubahan ${perubahan} akan membuat stok menjadi negatif (${stokBaru})`
    );
  }

  return satuanBarangRepository.adjustStok(id_satuan, perubahan);
};

/**
 * Hapus satuan barang. Melempar 409 jika sudah pernah dipakai dalam transaksi (FK RESTRICT).
 *
 * @param {number} id_satuan
 * @throws {ResponseError} 404 tidak ditemukan | 409 sudah dipakai transaksi
 */
export const hapusSatuan = async (id_satuan) => {
  try {
    const deleted = await satuanBarangRepository.remove(id_satuan);
    if (!deleted) {
      throw new ResponseError(404, `Satuan dengan id_satuan=${id_satuan} tidak ditemukan`);
    }
  } catch (err) {
    // FK RESTRICT dari detail_penjualan: foreign_key_violation (code 23503)
    if (err.code === '23503') {
      throw new ResponseError(
        409,
        'Tidak dapat menghapus satuan yang sudah pernah dipakai dalam transaksi'
      );
    }
    throw err;
  }
};
