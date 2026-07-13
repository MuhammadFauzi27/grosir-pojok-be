import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getFormData,
  getBarang,
  getDetailBarang,
  tambahBarang,
  updateBarang,
  hapusBarang,
} from '../controllers/barangController.js';

const router = express.Router();

// Semua endpoint barang memerlukan autentikasi JWT
router.use(authMiddleware);

// GET  /api/barang/form-data     — Data untuk form create (kategori + satuan)
// HARUS didefinisikan SEBELUM /:id_barang agar tidak ditangkap sebagai param
router.get('/form-data', getFormData);

// GET  /api/barang               — Daftar master barang (+ search, filter & pagination)
router.get('/', getBarang);

// POST /api/barang               — Tambah barang baru (Gudang)
router.post('/', tambahBarang);

// GET  /api/barang/:id_barang    — Detail barang
router.get('/:id_barang', getDetailBarang);

// PUT  /api/barang/:id_barang    — Perbarui data barang (Gudang)
router.put('/:id_barang', updateBarang);

// DELETE /api/barang/:id_barang  — Hapus barang (Gudang)
router.delete('/:id_barang', hapusBarang);

export default router;
