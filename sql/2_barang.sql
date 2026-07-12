-- ============================================================
-- 2. TABEL BARANG
--    Menyimpan master data barang (nama, kategori, & harga).
--    Stok ada di tabel stok, satuan ada di tabel satuan_barang.
-- ============================================================
CREATE TABLE barang (
    id_barang    SERIAL          PRIMARY KEY,
    nama_barang  VARCHAR(150)    NOT NULL,
    kategori     VARCHAR(100)    NOT NULL,
    harga_barang NUMERIC(15,2)   NOT NULL CHECK (harga_barang >= 0),
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  barang              IS 'Master data barang grosir';
COMMENT ON COLUMN barang.harga_barang IS 'Harga jual per barang (satuan dasar)';