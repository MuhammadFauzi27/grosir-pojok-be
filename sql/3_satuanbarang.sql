-- ============================================================
-- 3. TABEL SATUAN_BARANG
--    Satu barang dapat memiliki banyak satuan (dus, pak, pcs, dll.)
--    Harga ada di tabel barang, stok ada di tabel stok.
-- ============================================================
CREATE TABLE satuan_barang (
    id_satuan    SERIAL          PRIMARY KEY,
    id_barang    INT             NOT NULL,
    nama_satuan  VARCHAR(50)     NOT NULL,   -- contoh: 'Dus', 'Pak', 'Pcs'
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_satuan_barang
        FOREIGN KEY (id_barang) REFERENCES barang (id_barang)
            ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Satu barang tidak boleh punya dua satuan dengan nama sama
    CONSTRAINT uq_satuan_per_barang UNIQUE (id_barang, nama_satuan)
);

COMMENT ON TABLE satuan_barang IS 'Satuan kemasan per barang (mis: Dus, Pak, Pcs)';
