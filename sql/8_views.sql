-- ============================================================
-- 8. VIEW: STOK TERKINI (untuk tampilan gudang & kasir)
-- ============================================================
CREATE OR REPLACE VIEW v_stok_barang AS
SELECT
    b.id_barang,
    b.nama_barang,
    b.kategori,
    s.id_satuan,
    s.nama_satuan,
    s.harga_satuan,
    s.stok_satuan
FROM barang       b
         JOIN satuan_barang s ON s.id_barang = b.id_barang
ORDER BY b.nama_barang, s.nama_satuan;

COMMENT ON VIEW v_stok_barang IS 'Gabungan barang + satuan untuk ditampilkan ke kasir dan gudang';


-- ============================================================
-- 8. VIEW: RIWAYAT TRANSAKSI PENJUALAN (untuk laporan)
-- ============================================================
CREATE OR REPLACE VIEW v_riwayat_penjualan AS
SELECT
    p.no_nota_jual,
    p.tanggal_jual,
    pg.nama            AS nama_kasir,
    b.nama_barang,
    s.nama_satuan,
    dp.jumlah_jual,
    dp.subtotal_jual,
    SUM(dp.subtotal_jual) OVER (PARTITION BY p.no_nota_jual)
                           AS total_nota
FROM penjualan        p
         JOIN pegawai          pg ON pg.id_pegawai = p.id_pegawai
         JOIN detail_penjualan dp ON dp.no_nota_jual = p.no_nota_jual
         JOIN satuan_barang    s  ON s.id_satuan = dp.id_satuan
         JOIN barang           b  ON b.id_barang = s.id_barang
ORDER BY p.tanggal_jual DESC, p.no_nota_jual, b.nama_barang;

COMMENT ON VIEW v_riwayat_penjualan IS 'Riwayat lengkap transaksi per item beserta total per nota';
