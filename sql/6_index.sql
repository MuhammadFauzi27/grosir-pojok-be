-- ============================================================
-- 6. INDEX  (mempercepat query yang sering dipakai)
-- ============================================================
CREATE INDEX idx_stok_id_barang           ON stok             (id_barang);
CREATE INDEX idx_penjualan_username       ON penjualan        (username);
CREATE INDEX idx_penjualan_tanggal        ON penjualan        (tanggal_jual DESC);
CREATE INDEX idx_detail_no_nota           ON detail_penjualan (no_nota);
CREATE INDEX idx_detail_id_barang         ON detail_penjualan (id_barang);
