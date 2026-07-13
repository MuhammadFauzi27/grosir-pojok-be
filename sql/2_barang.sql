-- ============================================================
-- 2. TABEL BARANG
--    Menyimpan master data barang (nama, kategori, harga & satuan).
--    Stok ada di tabel stok (ONE-TO-ONE per barang).
--    Satuan mereferensikan tabel master satuan_barang.
-- ============================================================
CREATE TABLE barang (
    id_barang    SERIAL          PRIMARY KEY,
    nama_barang  VARCHAR(150)    NOT NULL,
    kategori     VARCHAR(100)    NOT NULL,
    harga_barang NUMERIC(15,2)   NOT NULL CHECK (harga_barang >= 0),
    id_satuan    INT             NOT NULL,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_barang_satuan
        FOREIGN KEY (id_satuan) REFERENCES satuan_barang (id_satuan)
            ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  barang              IS 'Master data barang grosir';
COMMENT ON COLUMN barang.harga_barang IS 'Harga jual per barang (satuan dasar)';
COMMENT ON COLUMN barang.id_satuan    IS 'Referensi ke tabel master satuan_barang';