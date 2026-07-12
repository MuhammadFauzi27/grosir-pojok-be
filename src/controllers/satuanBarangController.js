import * as satuanBarangService from '../services/satuanBarangService.js';
import ResponseError from '../exceptions/responseError.js';

// ─── GET /barang/:id_barang/satuan ─────────────────────────────────────────────
/**
 * Daftar satuan (unit kemasan) milik satu barang.
 */
export const getSatuanByBarang = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    const data = await satuanBarangService.getSatuanByBarang(id_barang);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── POST /barang/:id_barang/satuan ────────────────────────────────────────────
/**
 * Tambah satuan baru untuk sebuah barang. Hak akses: Gudang.
 * Satuan hanya menyimpan nama kemasan (harga ada di barang, stok ada di tabel stok).
 */
export const tambahSatuan = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    const { nama_satuan } = req.body;

    if (!nama_satuan || typeof nama_satuan !== 'string' || nama_satuan.trim() === '') {
      throw new ResponseError(400, 'nama_satuan wajib diisi');
    }

    const data = await satuanBarangService.tambahSatuan(id_barang, {
      nama_satuan: nama_satuan.trim(),
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── GET /satuan/:id_satuan ────────────────────────────────────────────────────
/**
 * Detail satu satuan barang.
 */
export const getDetailSatuan = async (req, res, next) => {
  try {
    const id_satuan = parseInt(req.params.id_satuan, 10);
    if (isNaN(id_satuan)) {
      throw new ResponseError(400, 'id_satuan harus berupa angka');
    }

    const data = await satuanBarangService.getDetailSatuan(id_satuan);
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /satuan/:id_satuan ────────────────────────────────────────────────────
/**
 * Perbarui nama satuan. Hak akses: Gudang.
 */
export const updateSatuan = async (req, res, next) => {
  try {
    const id_satuan = parseInt(req.params.id_satuan, 10);
    if (isNaN(id_satuan)) {
      throw new ResponseError(400, 'id_satuan harus berupa angka');
    }

    const { nama_satuan } = req.body;

    if (nama_satuan === undefined) {
      throw new ResponseError(400, 'nama_satuan wajib dikirim');
    }
    if (typeof nama_satuan !== 'string' || nama_satuan.trim() === '') {
      throw new ResponseError(400, 'nama_satuan harus berupa string tidak kosong');
    }

    const data = await satuanBarangService.updateSatuan(id_satuan, {
      nama_satuan: nama_satuan.trim(),
    });
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /satuan/:id_satuan ─────────────────────────────────────────────────
/**
 * Hapus satuan barang. Hak akses: Gudang.
 */
export const hapusSatuan = async (req, res, next) => {
  try {
    const id_satuan = parseInt(req.params.id_satuan, 10);
    if (isNaN(id_satuan)) {
      throw new ResponseError(400, 'id_satuan harus berupa angka');
    }

    await satuanBarangService.hapusSatuan(id_satuan);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
