import express from 'express';
import { getStokRealtime } from '../controllers/stokController.js';
import penjualanRoute from './penjualanRoute.js';
import authRoute from './authRoute.js';
import barangRoute from './barangRoute.js';
import satuanBarangRoute from './satuanBarangRoute.js';

const router = express.Router();

// ─── Endpoint /stok — backward compatible (belum di-refactor) ─────────────────
router.get('/stok', getStokRealtime);

// ─── Endpoint /auth — Layered Architecture ────────────────────────────────────
router.use('/auth', authRoute);

// ─── Endpoint /barang — Layered Architecture ──────────────────────────────────
router.use('/barang', barangRoute);

// ─── Endpoint /satuan — Layered Architecture ──────────────────────────────────
router.use('/satuan', satuanBarangRoute);

// ─── Endpoint /penjualan — Layered Architecture ───────────────────────────────
router.use('/penjualan', penjualanRoute);

export default router;