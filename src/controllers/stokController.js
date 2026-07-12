import * as stokService from '../services/stokService.js';
import ResponseError from '../exceptions/responseError.js';

// ─── GET /stok ──────────────────────────────────────────────────────────────
/**
 * Cek ketersediaan stok terkini (real-time).
 *
 * Query params opsional:
 *   - search       {string}  — cari berdasarkan nama_barang
 *   - kategori     {string}  — filter berdasarkan kategori barang
 *   - stok_menipis {boolean} — jika "true", hanya tampilkan barang dengan stok di bawah ambang batas minimum
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

// ─── PATCH /stok/:id_barang/penyesuaian ────────────────────────────────────
/**
 * Penyesuaian stok manual per barang (stock opname / barang masuk). Hak akses: Gudang.
 *
 * Body:
 *   - perubahan {number} — integer positif (tambah) atau negatif (kurangi)
 */
export const penyesuaianStok = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    const { perubahan } = req.body;

    if (perubahan === undefined || perubahan === null) {
      throw new ResponseError(400, 'perubahan wajib diisi');
    }
    if (typeof perubahan !== 'number' || !Number.isInteger(perubahan)) {
      throw new ResponseError(400, 'perubahan harus berupa bilangan bulat (positif atau negatif)');
    }

    const data = await stokService.penyesuaianStok(id_barang, perubahan);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};