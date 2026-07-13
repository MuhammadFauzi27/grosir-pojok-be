import ResponseError from '../exceptions/responseError.js';
import * as barangRepository from '../repositories/barangRepository.js';
import * as satuanBarangRepository from '../repositories/satuanBarangRepository.js';

/**
 * Ambil data yang dibutuhkan untuk mengisi form create barang:
 * - Daftar kategori yang sudah ada (dari barang existing)
 * - Daftar master satuan (seed)
 *
 * @returns {Promise<{ kategori: string[], satuan: object[] }>}
 */
export const getFormData = async () => {
  const [kategori, satuan] = await Promise.all([
    barangRepository.findAllKategori(),
    satuanBarangRepository.findAll(),
  ]);
  return { kategori, satuan };
};

/**
 * Ambil daftar barang dengan filter opsional & pagination.
 *
 * @param {object} query — query params mentah dari req.query
 * @returns {Promise<object[]>} array Barang (inkl. nama_satuan & jumlah_stok)
 */
export const getAllBarang = async (query) => {
  const page  = Math.max(1, parseInt(query.page  ?? 1,  10));
  const limit = Math.max(1, parseInt(query.limit ?? 20, 10));
  const search   = query.search   ?? undefined;
  const kategori = query.kategori ?? undefined;

  return barangRepository.findAll({ search, kategori, page, limit });
};

/**
 * Ambil detail satu barang.
 *
 * @param {number} id_barang
 * @returns {Promise<object>} Barang (inkl. nama_satuan & jumlah_stok)
 * @throws {ResponseError} 404 jika barang tidak ditemukan
 */
export const getDetailBarang = async (id_barang) => {
  const data = await barangRepository.findById(id_barang);
  if (!data) {
    throw new ResponseError(404, `Barang dengan id_barang=${id_barang} tidak ditemukan`);
  }
  return data;
};

/**
 * Tambah barang baru sekaligus mencatat stok awal.
 * Satuan dicocokkan berdasarkan nama (case-insensitive) ke tabel master.
 *
 * @param {object} param
 * @param {string} param.nama_barang
 * @param {string} param.kategori
 * @param {number} param.harga_barang
 * @param {string} param.nama_satuan  — nama satuan dari master (misal: 'pcs', 'kg')
 * @param {number} param.jumlah_stok  — stok awal barang
 * @returns {Promise<object>} Barang yang baru dibuat
 * @throws {ResponseError} 400 jika satuan tidak ditemukan di master
 */
export const tambahBarang = async ({ nama_barang, kategori, harga_barang, nama_satuan, jumlah_stok }) => {
  // Resolve nama satuan → id_satuan
  const satuan = await satuanBarangRepository.findByName(nama_satuan);
  if (!satuan) {
    throw new ResponseError(
      400,
      `Satuan '${nama_satuan}' tidak terdaftar. Gunakan salah satu satuan yang tersedia.`
    );
  }

  return barangRepository.insert({
    nama_barang,
    kategori,
    harga_barang,
    id_satuan  : satuan.id_satuan,
    jumlah_stok,
  });
};

/**
 * Perbarui data barang.
 * Field yang tidak dikirim dipertahankan nilainya (COALESCE).
 * Satuan barang tidak dapat diubah setelah dibuat.
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
 * Hapus barang. Baris stok ikut terhapus (ON DELETE CASCADE).
 * Melempar 409 jika barang masih dipakai dalam transaksi (FK RESTRICT dari detail_penjualan).
 *
 * @param {number} id_barang
 * @throws {ResponseError} 404 jika tidak ditemukan | 409 jika masih ada transaksi terkait
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
        'Tidak dapat menghapus barang yang masih memiliki riwayat transaksi'
      );
    }
    throw err;
  }
};
