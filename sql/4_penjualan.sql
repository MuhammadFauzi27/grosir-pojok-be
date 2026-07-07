-- ============================================================
-- 4. TABEL PENJUALAN
--    Header / nota transaksi penjualan.
--    Setiap nota dikerjakan oleh satu kasir (pegawai).
-- ============================================================
CREATE TABLE penjualan (
                           no_nota_jual    VARCHAR(30)     PRIMARY KEY,  -- format bebas: 'TRX-20260701-001'
                           tanggal_jual    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                           id_pegawai      INT             NOT NULL,

                           CONSTRAINT fk_penjualan_pegawai
                               FOREIGN KEY (id_pegawai) REFERENCES pegawai (id_pegawai)
                                   ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  penjualan              IS 'Header nota transaksi penjualan';
COMMENT ON COLUMN penjualan.no_nota_jual IS 'Nomor nota unik, contoh: TRX-20260701-001';