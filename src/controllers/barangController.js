import * as barangService from '../services/barangService.js';
import ResponseError from '../exceptions/responseError.js';

// ─── GET /barang ───────────────────────────────────────────────────────────────
/**
 * Daftar master barang dengan filter opsional (search, kategori) & pagination.
 */
export const getBarang = async (req, res, next) => {
  try {
    const data = await barangService.getAllBarang(req.query);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /barang/:id_barang ────────────────────────────────────────────────────
/**
 * Detail satu barang beserta seluruh satuannya.
 */
export const getDetailBarang = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    const data = await barangService.getDetailBarang(id_barang);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── POST /barang ──────────────────────────────────────────────────────────────
/**
 * Tambah barang baru. Hak akses: Gudang.
 */
export const tambahBarang = async (req, res, next) => {
  try {
    const { nama_barang, kategori } = req.body;

    if (!nama_barang || typeof nama_barang !== 'string' || nama_barang.trim() === '') {
      throw new ResponseError(400, 'nama_barang wajib diisi');
    }
    if (!kategori || typeof kategori !== 'string' || kategori.trim() === '') {
      throw new ResponseError(400, 'kategori wajib diisi');
    }

    const data = await barangService.tambahBarang({
      nama_barang: nama_barang.trim(),
      kategori: kategori.trim(),
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /barang/:id_barang ────────────────────────────────────────────────────
/**
 * Perbarui data barang. Hak akses: Gudang.
 */
export const updateBarang = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    const { nama_barang, kategori } = req.body;
    if (!nama_barang || typeof nama_barang !== 'string' || nama_barang.trim() === '') {
      throw new ResponseError(400, 'nama_barang wajib diisi');
    }
    if (!kategori || typeof kategori !== 'string' || kategori.trim() === '') {
      throw new ResponseError(400, 'kategori wajib diisi');
    }

    const data = await barangService.updateBarang(id_barang, {
      nama_barang: nama_barang.trim(),
      kategori: kategori.trim(),
    });
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /barang/:id_barang ─────────────────────────────────────────────────
/**
 * Hapus barang. Hak akses: Gudang.
 */
export const hapusBarang = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    await barangService.hapusBarang(id_barang);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ─── GET /barang/:id_barang/satuan ─────────────────────────────────────────────
/**
 * Daftar satuan milik satu barang (dipakai juga oleh route lama via backward-compat).
 * @deprecated — Gunakan satuanBarangController.getSatuanByBarang via barangRoute
 */
export const getSatuanByBarang = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    // Re-export dari satuanBarangService agar route lama tetap bekerja
    const { getSatuanByBarang: getSatuan } = await import('../services/satuanBarangService.js');
    const data = await getSatuan(id_barang);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};