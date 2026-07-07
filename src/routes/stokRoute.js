import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getStokRealtime } from '../controllers/stokController.js';

const router = express.Router();

// Semua endpoint stok memerlukan autentikasi JWT
router.use(authMiddleware);

// GET /stok — Cek ketersediaan stok terkini (real-time, untuk kasir & gudang)
router.get('/', getStokRealtime);

export default router;
