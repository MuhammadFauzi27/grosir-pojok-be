import ResponseError from '../exceptions/responseError.js';
import * as stokRepository from '../repositories/stokRepository.js';

/** Ambang batas stok dianggap "menipis" (satuan). */
const STOK_MENIPIS_MIN = 10;

/**
 * Ambil daftar stok terkini dari v_stok_barang dengan filter opsional.
 *
 * @param {object} query — query params mentah dari req.query
 * @param {string}  [query.search]       — cari berdasarkan nama_barang
 * @param {string}  [query.kategori]     — filter exact kategori
 * @param {string}  [query.stok_menipis] — string 'true' untuk filter stok rendah
 * @returns {Promise<object[]>} array StokBarang
 */
export const getStokRealtime = async (query) => {
  const search       = query.search   ? query.search.trim()   : undefined;
  const kategori     = query.kategori ? query.kategori.trim() : undefined;
  const stok_menipis = query.stok_menipis === 'true';

  return stokRepository.findAll({
    search,
    kategori,
    stok_menipis,
    stokMin: STOK_MENIPIS_MIN,
  });
};

/**
 * Penyesuaian stok manual per barang (stock opname / barang masuk).
 * Menolak jika hasil stok akan menjadi negatif (CHECK jumlah_stok >= 0).
 *
 * @param {number} id_barang  — barang yang stoknya disesuaikan
 * @param {number} perubahan  — positif untuk tambah, negatif untuk kurangi
 * @returns {Promise<object>} baris stok setelah disesuaikan
 * @throws {ResponseError} 404 tidak ditemukan | 400 stok jadi negatif
 */
export const penyesuaianStok = async (id_barang, perubahan) => {
  // Pastikan stok barang ada & cek jumlah saat ini
  const stok = await stokRepository.findByBarang(id_barang);
  if (!stok) {
    throw new ResponseError(404, `Data stok untuk id_barang=${id_barang} tidak ditemukan`);
  }

  const stokBaru = stok.jumlah_stok + perubahan;
  if (stokBaru < 0) {
    throw new ResponseError(
      400,
      `Penyesuaian stok gagal: stok saat ini ${stok.jumlah_stok}, perubahan ${perubahan} akan membuat stok menjadi negatif (${stokBaru})`
    );
  }

  return stokRepository.adjustStok(id_barang, perubahan);
};
