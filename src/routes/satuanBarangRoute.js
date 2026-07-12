import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getDetailSatuan,
  updateSatuan,
  hapusSatuan,
} from '../controllers/satuanBarangController.js';

const router = express.Router();

// Semua endpoint satuan memerlukan autentikasi JWT
router.use(authMiddleware);

// GET    /api/satuan/:id_satuan  — Detail satu satuan barang
router.get('/:id_satuan', getDetailSatuan);

// PUT    /api/satuan/:id_satuan  — Perbarui nama satuan (Gudang)
router.put('/:id_satuan', updateSatuan);

// DELETE /api/satuan/:id_satuan  — Hapus satuan barang (Gudang)
router.delete('/:id_satuan', hapusSatuan);

export default router;
