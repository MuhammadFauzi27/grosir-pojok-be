import * as stokService from '../services/stokService.js';

// ─── GET /stok ──────────────────────────────────────────────────────────────
/**
 * Cek ketersediaan stok terkini (real-time).
 *
 * Query params opsional:
 *   - search       {string}  — cari berdasarkan nama_barang atau kode SKU / nama_satuan
 *   - kategori     {string}  — filter berdasarkan kategori barang
 *   - stok_menipis {boolean} — jika "true", hanya tampilkan satuan dengan stok di bawah ambang batas minimum
 *
 * Response 200: array StokBarang (setara v_stok_barang)
 */
export const getStokRealtime = async (req, res, next) => {
  try {
    const data = await stokService.getStokRealtime(req.query);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};