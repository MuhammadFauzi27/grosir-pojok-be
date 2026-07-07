import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getBarang,
  getDetailBarang,
  tambahBarang,
  updateBarang,
  hapusBarang,
} from '../controllers/barangController.js';
import {
  getSatuanByBarang,
  tambahSatuan,
} from '../controllers/satuanBarangController.js';

const router = express.Router();

// Semua endpoint barang memerlukan autentikasi JWT
router.use(authMiddleware);

// GET  /api/barang               — Daftar master barang (+ filter & pagination)
router.get('/', getBarang);

// POST /api/barang               — Tambah barang baru (Gudang)
router.post('/', tambahBarang);

// GET  /api/barang/:id_barang    — Detail barang beserta seluruh satuannya
router.get('/:id_barang', getDetailBarang);

// PUT  /api/barang/:id_barang    — Perbarui data barang (Gudang)
router.put('/:id_barang', updateBarang);

// DELETE /api/barang/:id_barang  — Hapus barang (Gudang)
router.delete('/:id_barang', hapusBarang);

// GET  /api/barang/:id_barang/satuan  — Daftar satuan milik satu barang
router.get('/:id_barang/satuan', getSatuanByBarang);

// POST /api/barang/:id_barang/satuan  — Tambah satuan baru untuk barang (Gudang)
router.post('/:id_barang/satuan', tambahSatuan);

export default router;
