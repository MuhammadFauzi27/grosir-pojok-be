import * as penjualanService from '../services/penjualanService.js';
import ResponseError from '../exceptions/responseError.js';

// ─── GET /penjualan ────────────────────────────────────────────────────────────
export const getPenjualan = async (req, res, next) => {
  try {
    const data = await penjualanService.getAllPenjualan(req.query);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── POST /penjualan ───────────────────────────────────────────────────────────
export const catatPenjualan = async (req, res, next) => {
  try {
    const { no_nota, username, items } = req.body;

    // ── Validasi input minimal ──
    if (!username || typeof username !== 'string' || username.trim() === '') {
      throw new ResponseError(400, 'username kasir wajib diisi');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new ResponseError(400, 'items wajib berupa array dan tidak boleh kosong');
    }
    for (const [i, item] of items.entries()) {
      if (!item.id_barang || typeof item.id_barang !== 'number') {
        throw new ResponseError(400, `items[${i}].id_barang wajib diisi dan harus berupa angka`);
      }
      if (!item.jumlah_per_barang || typeof item.jumlah_per_barang !== 'number' || item.jumlah_per_barang < 1) {
        throw new ResponseError(400, `items[${i}].jumlah_per_barang harus berupa angka dan minimal 1`);
      }
    }

    const data = await penjualanService.catatPenjualan({ no_nota, username: username.trim(), items });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /penjualan/:no_nota ───────────────────────────────────────────────────
export const getDetailPenjualan = async (req, res, next) => {
  try {
    const { no_nota } = req.params;
    const data = await penjualanService.getDetailPenjualan(no_nota);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /penjualan/:no_nota/nota ──────────────────────────────────────────────
export const getNotaPenjualan = async (req, res, next) => {
  try {
    const { no_nota } = req.params;
    const data = await penjualanService.getNotaPenjualan(no_nota);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};
