-- ============================================================
-- 6. INDEX  (mempercepat query yang sering dipakai)
-- ============================================================
CREATE INDEX idx_satuan_barang_id_barang  ON satuan_barang    (id_barang);
CREATE INDEX idx_penjualan_id_pegawai     ON penjualan        (id_pegawai);
CREATE INDEX idx_penjualan_tanggal        ON penjualan        (tanggal_jual DESC);
CREATE INDEX idx_detail_no_nota           ON detail_penjualan (no_nota_jual);
CREATE INDEX idx_detail_id_satuan         ON detail_penjualan (id_satuan);
