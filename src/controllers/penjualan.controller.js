import * as penjualanService from '../services/penjualan.service.js';
import ResponseError from '../exceptions/responseError.js';

// ─── GET /penjualan ────────────────────────────────────────────────────────────
/**
 * Ambil daftar riwayat transaksi penjualan.
 * Query params opsional: id_pegawai, tanggal_mulai, tanggal_selesai, page, limit
 */
export const getPenjualan = async (req, res, next) => {
  try {
    const data = await penjualanService.getAllPenjualan(req.query);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── POST /penjualan ───────────────────────────────────────────────────────────
/**
 * Catat transaksi penjualan baru (checkout kasir).
 * Body: { id_pegawai, items: [{id_satuan, jumlah_jual}], no_nota_jual? }
 */
export const catatPenjualan = async (req, res, next) => {
  try {
    const { no_nota_jual, id_pegawai, items } = req.body;

    // ── Validasi input minimal ──
    if (!id_pegawai || typeof id_pegawai !== 'number') {
      throw new ResponseError(400, 'id_pegawai wajib diisi dan harus berupa angka');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new ResponseError(400, 'items wajib berupa array dan tidak boleh kosong');
    }
    for (const [i, item] of items.entries()) {
      if (!item.id_satuan || typeof item.id_satuan !== 'number') {
        throw new ResponseError(400, `items[${i}].id_satuan wajib diisi dan harus berupa angka`);
      }
      if (!item.jumlah_jual || typeof item.jumlah_jual !== 'number' || item.jumlah_jual < 1) {
        throw new ResponseError(400, `items[${i}].jumlah_jual harus berupa angka dan minimal 1`);
      }
    }

    const data = await penjualanService.catatPenjualan({ no_nota_jual, id_pegawai, items });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /penjualan/:no_nota_jual ──────────────────────────────────────────────
/**
 * Detail satu nota penjualan beserta seluruh item.
 */
export const getDetailPenjualan = async (req, res, next) => {
  try {
    const { no_nota_jual } = req.params;
    const data = await penjualanService.getDetailPenjualan(no_nota_jual);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /penjualan/:no_nota_jual/nota ────────────────────────────────────────
/**
 * Data nota terformat untuk cetak struk thermal kasir.
 */
export const getNotaPenjualan = async (req, res, next) => {
  try {
    const { no_nota_jual } = req.params;
    const data = await penjualanService.getNotaPenjualan(no_nota_jual);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};
