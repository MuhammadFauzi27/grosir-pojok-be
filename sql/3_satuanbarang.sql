-- ============================================================
-- 3. TABEL SATUAN_BARANG
--    Satu barang dapat memiliki banyak satuan (dus, pak, pcs, dll.)
--    Setiap satuan mempunyai harga dan stok masing-masing.
-- ============================================================
CREATE TABLE satuan_barang (
                               id_satuan       SERIAL          PRIMARY KEY,
                               id_barang       INT             NOT NULL,
                               nama_satuan     VARCHAR(50)     NOT NULL,   -- contoh: 'Dus', 'Pak', 'Pcs'
                               harga_satuan    NUMERIC(15,2)   NOT NULL CHECK (harga_satuan >= 0),
                               stok_satuan     INT             NOT NULL DEFAULT 0 CHECK (stok_satuan >= 0),
                               created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

                               CONSTRAINT fk_satuan_barang
                                   FOREIGN KEY (id_barang) REFERENCES barang (id_barang)
                                       ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Satu barang tidak boleh punya dua satuan dengan nama sama
                               CONSTRAINT uq_satuan_per_barang UNIQUE (id_barang, nama_satuan)
);

COMMENT ON TABLE  satuan_barang              IS 'Satuan jual per barang, lengkap dengan harga & stok';
COMMENT ON COLUMN satuan_barang.stok_satuan  IS 'Stok dipotong otomatis oleh trigger saat transaksi selesai';
