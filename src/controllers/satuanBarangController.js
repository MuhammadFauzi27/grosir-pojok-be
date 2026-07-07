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
 */
export const tambahSatuan = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    const { nama_satuan, harga_satuan, stok_satuan } = req.body;

    if (!nama_satuan || typeof nama_satuan !== 'string' || nama_satuan.trim() === '') {
      throw new ResponseError(400, 'nama_satuan wajib diisi');
    }
    if (harga_satuan === undefined || harga_satuan === null || typeof harga_satuan !== 'number' || harga_satuan < 0) {
      throw new ResponseError(400, 'harga_satuan wajib berupa angka >= 0');
    }
    if (stok_satuan === undefined || stok_satuan === null || typeof stok_satuan !== 'number' || stok_satuan < 0 || !Number.isInteger(stok_satuan)) {
      throw new ResponseError(400, 'stok_satuan wajib berupa bilangan bulat >= 0');
    }

    const data = await satuanBarangService.tambahSatuan(id_barang, {
      nama_satuan: nama_satuan.trim(),
      harga_satuan,
      stok_satuan,
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
 * Perbarui harga dan/atau nama satuan. Hak akses: Gudang.
 * Bukan untuk penyesuaian stok — gunakan PATCH /satuan/:id_satuan/penyesuaian-stok.
 */
export const updateSatuan = async (req, res, next) => {
  try {
    const id_satuan = parseInt(req.params.id_satuan, 10);
    if (isNaN(id_satuan)) {
      throw new ResponseError(400, 'id_satuan harus berupa angka');
    }

    const { nama_satuan, harga_satuan } = req.body;

    // Setidaknya satu field harus ada
    if (nama_satuan === undefined && harga_satuan === undefined) {
      throw new ResponseError(400, 'Minimal satu field (nama_satuan atau harga_satuan) harus dikirim');
    }
    if (nama_satuan !== undefined && (typeof nama_satuan !== 'string' || nama_satuan.trim() === '')) {
      throw new ResponseError(400, 'nama_satuan harus berupa string tidak kosong');
    }
    if (harga_satuan !== undefined && (typeof harga_satuan !== 'number' || harga_satuan < 0)) {
      throw new ResponseError(400, 'harga_satuan harus berupa angka >= 0');
    }

    const data = await satuanBarangService.updateSatuan(id_satuan, {
      nama_satuan: nama_satuan?.trim(),
      harga_satuan,
    });
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /satuan/:id_satuan/penyesuaian-stok ────────────────────────────────
/**
 * Penyesuaian stok manual (stock opname / barang masuk). Hak akses: Gudang.
 */
export const penyesuaianStok = async (req, res, next) => {
  try {
    const id_satuan = parseInt(req.params.id_satuan, 10);
    if (isNaN(id_satuan)) {
      throw new ResponseError(400, 'id_satuan harus berupa angka');
    }

    const { perubahan, catatan } = req.body;

    if (perubahan === undefined || perubahan === null) {
      throw new ResponseError(400, 'perubahan wajib diisi');
    }
    if (typeof perubahan !== 'number' || !Number.isInteger(perubahan)) {
      throw new ResponseError(400, 'perubahan harus berupa bilangan bulat (positif atau negatif)');
    }

    const data = await satuanBarangService.penyesuaianStok(id_satuan, perubahan, catatan);
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
