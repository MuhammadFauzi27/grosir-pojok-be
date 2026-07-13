-- ============================================================
-- 3. TABEL SATUAN_BARANG (Master Data)
--    Daftar satuan tetap yang di-seed oleh sistem.
--    Tidak dapat ditambah/diubah/dihapus melalui API.
--    Barang mereferensikan tabel ini via FK di tabel barang.
-- ============================================================
CREATE TABLE satuan_barang (
    id_satuan    SERIAL          PRIMARY KEY,
    nama_satuan  VARCHAR(50)     NOT NULL UNIQUE
);

COMMENT ON TABLE  satuan_barang             IS 'Master satuan barang (pcs, kg, liter, dll.) — bersifat tetap (seed-only)';
COMMENT ON COLUMN satuan_barang.nama_satuan IS 'Nama satuan unik, contoh: pcs, kg, liter, dus, pak';
