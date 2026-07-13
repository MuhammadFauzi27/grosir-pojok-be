import * as barangService from '../services/barangService.js';
import ResponseError from '../exceptions/responseError.js';

// ─── GET /barang/form-data ─────────────────────────────────────────────────────
/**
 * Data untuk mengisi form create barang:
 * - kategori: daftar kategori yang sudah ada (dari barang existing)
 * - satuan  : daftar master satuan (pcs, kg, liter, dst.)
 */
export const getFormData = async (req, res, next) => {
  try {
    const data = await barangService.getFormData();
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
};

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
 * Detail satu barang (inkl. nama_satuan & jumlah_stok).
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
 * Tambah barang baru sekaligus stok awal. Hak akses: Gudang.
 * Body: { nama_barang, kategori, harga_barang, nama_satuan, jumlah_stok }
 */
export const tambahBarang = async (req, res, next) => {
  try {
    const { nama_barang, kategori, harga_barang, nama_satuan, jumlah_stok } = req.body;

    if (!nama_barang || typeof nama_barang !== 'string' || nama_barang.trim() === '') {
      throw new ResponseError(400, 'nama_barang wajib diisi');
    }
    if (!kategori || typeof kategori !== 'string' || kategori.trim() === '') {
      throw new ResponseError(400, 'kategori wajib diisi');
    }
    if (harga_barang === undefined || harga_barang === null || typeof harga_barang !== 'number' || harga_barang < 0) {
      throw new ResponseError(400, 'harga_barang wajib berupa angka >= 0');
    }
    if (!nama_satuan || typeof nama_satuan !== 'string' || nama_satuan.trim() === '') {
      throw new ResponseError(400, 'nama_satuan wajib diisi');
    }
    if (jumlah_stok === undefined || jumlah_stok === null || !Number.isInteger(jumlah_stok) || jumlah_stok < 0) {
      throw new ResponseError(400, 'jumlah_stok wajib berupa bilangan bulat >= 0');
    }

    const data = await barangService.tambahBarang({
      nama_barang : nama_barang.trim(),
      kategori    : kategori.trim(),
      harga_barang,
      nama_satuan : nama_satuan.trim().toLowerCase(),
      jumlah_stok,
    });
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /barang/:id_barang ────────────────────────────────────────────────────
/**
 * Perbarui data barang. Hak akses: Gudang.
 * Field yang tidak dikirim dipertahankan nilainya.
 * Satuan tidak dapat diubah setelah dibuat.
 */
export const updateBarang = async (req, res, next) => {
  try {
    const id_barang = parseInt(req.params.id_barang, 10);
    if (isNaN(id_barang)) {
      throw new ResponseError(400, 'id_barang harus berupa angka');
    }

    const { nama_barang, kategori, harga_barang } = req.body;

    if (nama_barang === undefined && kategori === undefined && harga_barang === undefined) {
      throw new ResponseError(400, 'Minimal satu field (nama_barang, kategori, atau harga_barang) harus dikirim');
    }
    if (nama_barang !== undefined && (typeof nama_barang !== 'string' || nama_barang.trim() === '')) {
      throw new ResponseError(400, 'nama_barang harus berupa string tidak kosong');
    }
    if (kategori !== undefined && (typeof kategori !== 'string' || kategori.trim() === '')) {
      throw new ResponseError(400, 'kategori harus berupa string tidak kosong');
    }
    if (harga_barang !== undefined && (typeof harga_barang !== 'number' || harga_barang < 0)) {
      throw new ResponseError(400, 'harga_barang harus berupa angka >= 0');
    }

    const data = await barangService.updateBarang(id_barang, {
      nama_barang  : nama_barang?.trim(),
      kategori     : kategori?.trim(),
      harga_barang,
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