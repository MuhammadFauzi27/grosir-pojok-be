import pool from '../config/database.js';
import ResponseError from '../exceptions/responseError.js';
import * as penjualanRepository from '../repositories/penjualanRepository.js';

// ─── Helper: Generate no_nota_jual ────────────────────────────────────────────
/**
 * Membuat nomor nota otomatis dalam format TRX-YYYYMMDD-NNN.
 * NNN adalah nomor urut transaksi hari ini (3 digit, zero-padded).
 * Harus dipanggil di dalam blok transaksi DB agar count-nya akurat.
 *
 * @param {import('pg').PoolClient} client
 * @returns {Promise<string>} contoh: "TRX-20260707-001"
 */
const generateNoNota = async (client) => {
  const now = new Date();
  // Format YYYYMMDD
  const dateStr = now.toISOString().slice(0, 10); // "2026-07-07"
  const datePart = dateStr.replace(/-/g, '');     // "20260707"

  const count = await penjualanRepository.countByDate(client, dateStr);
  const urut = String(count + 1).padStart(3, '0');

  return `TRX-${datePart}-${urut}`;
};

// ─── Service Functions ─────────────────────────────────────────────────────────

/**
 * Ambil daftar riwayat penjualan dengan filter opsional & pagination.
 *
 * @param {object} filters
 * @returns {Promise<object[]>} array PenjualanSummary
 */
export const getAllPenjualan = async (filters) => {
  const page  = Math.max(1, parseInt(filters.page  ?? 1,  10));
  const limit = Math.max(1, parseInt(filters.limit ?? 20, 10));
  const id_pegawai       = filters.id_pegawai   ? parseInt(filters.id_pegawai, 10) : undefined;
  const tanggal_mulai    = filters.tanggal_mulai    ?? undefined;
  const tanggal_selesai  = filters.tanggal_selesai  ?? undefined;

  return penjualanRepository.findAll({ id_pegawai, tanggal_mulai, tanggal_selesai, page, limit });
};

/**
 * Catat transaksi penjualan baru secara atomik:
 *  1. BEGIN transaksi PostgreSQL
 *  2. Generate no_nota_jual jika tidak dikirim client
 *  3. Insert header penjualan
 *  4. Ambil snapshot harga setiap item (FOR UPDATE), hitung subtotal
 *  5. Bulk-insert detail_penjualan → trigger DB potong stok otomatis
 *  6. COMMIT (atau ROLLBACK jika ada error)
 *  7. Return PenjualanDetail lengkap
 *
 * @param {object} payload
 * @param {string|undefined} payload.no_nota_jual   — opsional, di-generate jika kosong
 * @param {number} payload.id_pegawai
 * @param {Array<{id_satuan: number, jumlah_jual: number}>} payload.items
 * @returns {Promise<object>} PenjualanDetail
 * @throws {ResponseError} 400 jika satuan tidak ditemukan | 409 jika stok tidak cukup
 */
export const catatPenjualan = async ({ no_nota_jual, id_pegawai, items }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // — Generate nomor nota jika tidak dikirim —
    const noNota = no_nota_jual?.trim() || (await generateNoNota(client));

    // — Insert header penjualan —
    await penjualanRepository.insertHeader(client, {
      no_nota_jual: noNota,
      id_pegawai,
    });

    // — Siapkan detail: ambil harga, hitung subtotal —
    const detailRows = [];
    for (const item of items) {
      const satuan = await penjualanRepository.getSatuanHarga(client, item.id_satuan);

      if (!satuan) {
        throw new ResponseError(404, `Satuan dengan id_satuan=${item.id_satuan} tidak ditemukan`);
      }

      detailRows.push({
        no_nota_jual : noNota,
        id_satuan    : item.id_satuan,
        jumlah_jual  : item.jumlah_jual,
        subtotal_jual: parseFloat(satuan.harga_satuan) * item.jumlah_jual,
      });
    }

    // — Bulk insert detail; trigger trg_potong_stok akan potong stok per baris —
    await penjualanRepository.insertDetailBulk(client, detailRows);

    await client.query('COMMIT');

    // — Ambil data lengkap untuk response —
    const detail = await penjualanRepository.findByNota(noNota);
    return detail;

  } catch (err) {
    await client.query('ROLLBACK');

    // Terjemahkan error dari trigger DB menjadi ResponseError 409
    if (err.message && err.message.includes('Stok tidak mencukupi')) {
      throw new ResponseError(409, err.message);
    }

    // Teruskan ResponseError yang sudah dibuat di atas (404, dsb.)
    if (err instanceof ResponseError) throw err;

    // Error tidak terduga
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Ambil detail satu nota penjualan beserta seluruh item.
 *
 * @param {string} no_nota_jual
 * @returns {Promise<object>} PenjualanDetail
 * @throws {ResponseError} 404 jika nota tidak ditemukan
 */
export const getDetailPenjualan = async (no_nota_jual) => {
  const data = await penjualanRepository.findByNota(no_nota_jual);
  if (!data) {
    throw new ResponseError(404, `Nota penjualan '${no_nota_jual}' tidak ditemukan`);
  }
  return data;
};

/**
 * Ambil data nota untuk keperluan cetak struk thermal.
 * Data yang dikembalikan identik dengan getDetailPenjualan —
 * format/cetak diurus oleh sisi client (frontend/printer).
 *
 * @param {string} no_nota_jual
 * @returns {Promise<object>} PenjualanDetail
 * @throws {ResponseError} 404 jika nota tidak ditemukan
 */
export const getNotaPenjualan = async (no_nota_jual) => {
  return getDetailPenjualan(no_nota_jual);
};
