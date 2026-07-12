-- ============================================================
-- 3b. TABEL STOK
--     Menyimpan jumlah stok per barang.
--     Satu barang memiliki satu baris stok.
--     Stok dikurangi otomatis via trigger saat ada transaksi penjualan.
-- ============================================================
CREATE TABLE stok (
    id_stok      SERIAL  PRIMARY KEY,
    id_barang    INT     NOT NULL UNIQUE,
    jumlah_stok  INT     NOT NULL DEFAULT 0 CHECK (jumlah_stok >= 0),

    CONSTRAINT fk_stok_barang
        FOREIGN KEY (id_barang) REFERENCES barang (id_barang)
            ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE  stok             IS 'Stok barang — satu baris per barang';
COMMENT ON COLUMN stok.jumlah_stok IS 'Stok dipotong otomatis oleh trigger saat transaksi penjualan';
