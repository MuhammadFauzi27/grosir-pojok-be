import express from 'express';
import penjualanRoute from './penjualanRoute.js';
import authRoute from './authRoute.js';
import barangRoute from './barangRoute.js';
import satuanBarangRoute from './satuanBarangRoute.js';
import stokRoute from './stokRoute.js';

const router = express.Router();

// ─── Endpoint /auth — Layered Architecture ────────────────────────────────────
router.use('/auth', authRoute);

// ─── Endpoint /barang — Layered Architecture ──────────────────────────────────
router.use('/barang', barangRoute);

// ─── Endpoint /satuan — Layered Architecture ──────────────────────────────────
router.use('/satuan', satuanBarangRoute);

// ─── Endpoint /stok — Layered Architecture ────────────────────────────────────
router.use('/stok', stokRoute);

// ─── Endpoint /penjualan — Layered Architecture ───────────────────────────────
router.use('/penjualan', penjualanRoute);

export default router;