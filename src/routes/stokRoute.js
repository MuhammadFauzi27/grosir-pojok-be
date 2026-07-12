import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getStokRealtime, penyesuaianStok } from '../controllers/stokController.js';

const router = express.Router();

// Semua endpoint stok memerlukan autentikasi JWT
router.use(authMiddleware);

// GET   /api/stok                          — Cek ketersediaan stok terkini (kasir & gudang)
router.get('/', getStokRealtime);

// PATCH /api/stok/:id_barang/penyesuaian  — Penyesuaian stok manual per barang (Gudang)
router.patch('/:id_barang/penyesuaian', penyesuaianStok);

export default router;
