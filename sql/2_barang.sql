-- ============================================================
-- 2. TABEL BARANG
--    Menyimpan master data barang (nama & kategori).
--    Detail satuan dan stok ada di tabel satuan_barang.
-- ============================================================
CREATE TABLE barang (
                        id_barang   SERIAL          PRIMARY KEY,
                        nama_barang VARCHAR(150)    NOT NULL,
                        kategori    VARCHAR(100)    NOT NULL,
                        created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE barang IS 'Master data barang grosir (tanpa stok — stok ada di satuan_barang)';