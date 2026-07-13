import * as satuanBarangService from '../services/satuanBarangService.js';

// ─── GET /satuan ───────────────────────────────────────────────────────────────
/**
 * Daftar master satuan barang (seed-only, tidak dapat diubah via API).
 */
export const getListSatuan = async (req, res, next) => {
  try {
    const data = await satuanBarangService.getAllSatuan();
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};
