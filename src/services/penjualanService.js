import pool from '../config/database.js';
import ResponseError from '../exceptions/responseError.js';
import * as penjualanRepository from '../repositories/penjualanRepository.js';

// ─── Helper: Generate no_nota ────────────────────────────────────────────────
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
  const username         = filters.username        ?? undefined;
  const tanggal_mulai    = filters.tanggal_mulai   ?? undefined;
  const tanggal_selesai  = filters.tanggal_selesai ?? undefined;

  return penjualanRepository.findAll({ username, tanggal_mulai, tanggal_selesai, page, limit });
};

/**
 * Catat transaksi penjualan baru secara atomik:
 *  1. BEGIN transaksi PostgreSQL
 *  2. Generate no_nota jika tidak dikirim client
 *  3. Hitung subtotal & total_jual dari harga_barang snapshot
 *  4. Insert header penjualan (dengan total_jual)
 *  5. Bulk-insert detail_penjualan → trigger DB potong stok otomatis
 *  6. COMMIT (atau ROLLBACK jika ada error)
 *  7. Return PenjualanDetail lengkap
 *
 * @param {object} payload
 * @param {string|undefined} payload.no_nota    — opsional, di-generate jika kosong
 * @param {string}           payload.username   — username kasir
 * @param {Array<{id_barang: number, jumlah_per_barang: number}>} payload.items
 * @returns {Promise<object>} PenjualanDetail
 * @throws {ResponseError} 400 jika barang tidak ditemukan | 409 jika stok tidak cukup
 */
export const catatPenjualan = async ({ no_nota, username, items }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // — Generate nomor nota jika tidak dikirim —
    const noNota = no_nota?.trim() || (await generateNoNota(client));

    // — Siapkan detail: ambil harga_barang, hitung subtotal —
    const detailRows = [];
    let total_jual = 0;

    for (const item of items) {
      const barang = await penjualanRepository.getBarangHarga(client, item.id_barang);

      if (!barang) {
        throw new ResponseError(404, `Barang dengan id_barang=${item.id_barang} tidak ditemukan`);
      }

      const subtotal = parseFloat(barang.harga_barang) * item.jumlah_per_barang;
      total_jual += subtotal;

      detailRows.push({
        no_nota          : noNota,
        id_barang        : item.id_barang,
        jumlah_per_barang: item.jumlah_per_barang,
        subtotal_jual    : subtotal,
      });
    }

    // — Insert header penjualan (total_jual sudah dihitung) —
    await penjualanRepository.insertHeader(client, {
      no_nota: noNota,
      username,
      total_jual,
    });

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
    if (err.message && err.message.includes('Data stok tidak ditemukan')) {
      throw new ResponseError(404, err.message);
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
 * @param {string} no_nota
 * @returns {Promise<object>} PenjualanDetail
 * @throws {ResponseError} 404 jika nota tidak ditemukan
 */
export const getDetailPenjualan = async (no_nota) => {
  const data = await penjualanRepository.findByNota(no_nota);
  if (!data) {
    throw new ResponseError(404, `Nota penjualan '${no_nota}' tidak ditemukan`);
  }
  return data;
};

/**
 * Ambil data nota untuk keperluan cetak struk thermal.
 * Data yang dikembalikan identik dengan getDetailPenjualan —
 * format/cetak diurus oleh sisi client (frontend/printer).
 *
 * @param {string} no_nota
 * @returns {Promise<object>} PenjualanDetail
 * @throws {ResponseError} 404 jika nota tidak ditemukan
 */
export const getNotaPenjualan = async (no_nota) => {
  return getDetailPenjualan(no_nota);
};
