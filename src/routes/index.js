import express from 'express';
import { getBarang, getSatuanByBarang } from '../controllers/barangController.js';
import { catatPenjualan } from '../controllers/penjualanController.js';
import { getStokRealtime } from '../controllers/stokController.js';

const router = express.Router();

router.get('/barang', getBarang);
router.get('/barang/:id_barang/satuan', getSatuanByBarang);
router.post('/penjualan', catatPenjualan);
router.get('/stok', getStokRealtime);

export default router;