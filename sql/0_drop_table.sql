-- ------------------------------------------------------------
-- 0. SETUP: Hapus tabel jika sudah ada (urutan DROP sesuai FK)
-- ------------------------------------------------------------
DROP VIEW  IF EXISTS v_riwayat_penjualan CASCADE;
DROP VIEW  IF EXISTS v_stok_barang       CASCADE;

DROP TABLE IF EXISTS detail_penjualan CASCADE;
DROP TABLE IF EXISTS penjualan         CASCADE;
DROP TABLE IF EXISTS stok              CASCADE;
DROP TABLE IF EXISTS satuan_barang     CASCADE;
DROP TABLE IF EXISTS barang            CASCADE;
DROP TABLE IF EXISTS pegawai           CASCADE;

-- Hapus trigger function jika sudah ada
DROP FUNCTION IF EXISTS fn_potong_stok() CASCADE;