import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getListSatuan } from '../controllers/satuanBarangController.js';

const router = express.Router();

// Semua endpoint satuan memerlukan autentikasi JWT
router.use(authMiddleware);

// GET /api/satuan  — Daftar master satuan barang (seed-only, read-only)
router.get('/', getListSatuan);

export default router;
