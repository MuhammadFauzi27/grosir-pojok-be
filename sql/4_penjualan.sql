-- ============================================================
-- 4. TABEL PENJUALAN
--    Header / nota transaksi penjualan.
--    Setiap nota dikerjakan oleh satu kasir (pegawai via username).
-- ============================================================
CREATE TABLE penjualan (
    no_nota      VARCHAR(30)     PRIMARY KEY,   -- format: 'TRX-20260701-001'
    tanggal_jual TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    total_jual   NUMERIC(15,2)   NOT NULL DEFAULT 0 CHECK (total_jual >= 0),
    username     VARCHAR(50)     NOT NULL,

    CONSTRAINT fk_penjualan_pegawai
        FOREIGN KEY (username) REFERENCES pegawai (username)
            ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  penjualan          IS 'Header nota transaksi penjualan';
COMMENT ON COLUMN penjualan.no_nota  IS 'Nomor nota unik, contoh: TRX-20260701-001';
COMMENT ON COLUMN penjualan.username IS 'Username kasir yang memproses transaksi';