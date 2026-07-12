-- ============================================================
-- 8. VIEW: STOK TERKINI (untuk tampilan gudang & kasir)
-- ============================================================
CREATE OR REPLACE VIEW v_stok_barang AS
SELECT
    b.id_barang,
    b.nama_barang,
    b.kategori,
    b.harga_barang,
    st.id_stok,
    st.jumlah_stok
FROM barang b
JOIN stok   st ON st.id_barang = b.id_barang
ORDER BY b.nama_barang;

COMMENT ON VIEW v_stok_barang IS 'Gabungan barang + stok untuk ditampilkan ke kasir dan gudang';


-- ============================================================
-- 8b. VIEW: RIWAYAT TRANSAKSI PENJUALAN (untuk laporan)
-- ============================================================
CREATE OR REPLACE VIEW v_riwayat_penjualan AS
SELECT
    p.no_nota,
    p.tanggal_jual,
    p.total_jual,
    p.username,
    pg.nama              AS nama_kasir,
    b.id_barang,
    b.nama_barang,
    dp.jumlah_per_barang,
    dp.subtotal_jual
FROM penjualan        p
JOIN pegawai          pg ON pg.username  = p.username
JOIN detail_penjualan dp ON dp.no_nota  = p.no_nota
JOIN barang           b  ON b.id_barang = dp.id_barang
ORDER BY p.tanggal_jual DESC, p.no_nota, b.nama_barang;

COMMENT ON VIEW v_riwayat_penjualan IS 'Riwayat lengkap transaksi per item beserta total per nota';
