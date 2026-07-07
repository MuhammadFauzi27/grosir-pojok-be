import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getPenjualan,
  catatPenjualan,
  getDetailPenjualan,
  getNotaPenjualan,
} from '../controllers/penjualanController.js';

const router = express.Router();

// Semua endpoint penjualan memerlukan autentikasi JWT
router.use(authMiddleware);

// GET  /api/penjualan              — Daftar riwayat transaksi
router.get('/', getPenjualan);

// POST /api/penjualan              — Catat transaksi baru (checkout kasir)
router.post('/', catatPenjualan);

// GET  /api/penjualan/:no_nota_jual        — Detail satu nota + item
router.get('/:no_nota_jual', getDetailPenjualan);

// GET  /api/penjualan/:no_nota_jual/nota   — Data untuk cetak struk thermal
router.get('/:no_nota_jual/nota', getNotaPenjualan);

export default router;
