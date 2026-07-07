import * as stokRepository from '../repositories/stokRepository.js';

/** Ambang batas stok dianggap "menipis" (satuan). */
const STOK_MENIPIS_MIN = 10;

/**
 * Ambil daftar stok terkini dari v_stok_barang dengan filter opsional.
 *
 * @param {object} query — query params mentah dari req.query
 * @param {string}  [query.search]       — cari berdasarkan nama_barang / nama_satuan
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
