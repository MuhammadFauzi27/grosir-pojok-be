-- ============================================================
-- 9. DATA AWAL (SEED)
-- ============================================================

-- >> Pegawai contoh (password: plain — ganti hash sebelum production!)
INSERT INTO pegawai (nama, username, password, role) VALUES
    ('Budi Santoso',   'kasir01',  'kasir01',  'kasir'),
    ('Dian Rahayu',    'kasir02',  'kasir02',  'kasir'),
    ('Eko Prasetyo',   'gudang01', 'gudang01', 'gudang');

-- -- >> Master barang contoh (termasuk harga_barang)
-- INSERT INTO barang (nama_barang, kategori, harga_barang) VALUES
--     ('Indomie Goreng',  'Mie Instan',    3500),
--     ('Bimoli 2L',       'Minyak Goreng', 38000),
--     ('Gula Pasir',      'Sembako',       15500),
--     ('Rinso Bubuk',     'Detergen',      27000),
--     ('Aqua 600ml',      'Minuman',       3500);

-- -- >> Satuan barang contoh (hanya nama satuan, tanpa harga & stok)
-- INSERT INTO satuan_barang (id_barang, nama_satuan) VALUES
--     (1, 'Dus'),
--     (1, 'Pak'),
--     (2, 'Karton'),
--     (2, 'Botol'),
--     (3, 'Karung'),
--     (3, 'Kg'),
--     (4, 'Karton'),
--     (4, 'Pak'),
--     (5, 'Dus'),
--     (5, 'Botol');

-- -- >> Stok awal per barang
-- INSERT INTO stok (id_barang, jumlah_stok) VALUES
--     (1, 500),
--     (2, 150),
--     (3, 400),
--     (4, 200),
--     (5, 800);

-- -- >> Contoh transaksi penjualan
-- INSERT INTO penjualan (no_nota, tanggal_jual, total_jual, username) VALUES
--     ('TRX-20260701-001', '2026-07-01 09:15:00+07', 421500, 'kasir01'),
--     ('TRX-20260701-002', '2026-07-01 10:30:00+07', 139500, 'kasir02');

-- -- >> Detail penjualan (trigger akan memotong stok otomatis)
-- INSERT INTO detail_penjualan (no_nota, id_barang, jumlah_per_barang, subtotal_jual) VALUES
--     -- Nota 001: 3 Indomie + 2 Bimoli + 5 Gula
--     ('TRX-20260701-001', 1,  3,   10500),
--     ('TRX-20260701-001', 2,  2,   76000),
--     ('TRX-20260701-001', 3,  5,   77500),
--     -- Nota 002: 1 Rinso + 10 Aqua
--     ('TRX-20260701-002', 4,  1,   27000),
--     ('TRX-20260701-002', 5, 10,   35000);
