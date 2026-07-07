import express from 'express';
import { getBarang, getSatuanByBarang } from '../controllers/barangController.js';
import { getStokRealtime } from '../controllers/stokController.js';
import penjualanRoute from './penjualanRoute.js';

const router = express.Router();

// ─── Endpoint lama (dipertahankan, backward compatible) ───────────────────────
router.get('/barang', getBarang);
router.get('/barang/:id_barang/satuan', getSatuanByBarang);
router.get('/stok', getStokRealtime);

// ─── Endpoint /penjualan — Layered Architecture ───────────────────────────────
router.use('/penjualan', penjualanRoute);

export default router;