-- ============================================================
-- 10. DATA AWAL (SEED)
-- ============================================================

-- >> Pegawai contoh (password: 'password123' — ganti hash sebelum production!)
INSERT INTO pegawai (nama, username, password, role) VALUES
                                                         ('Budi Santoso',   'kasir01',  '$2b$10$xxxxxHASHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'kasir'),
                                                         ('Dian Rahayu',    'kasir02',  '$2b$10$xxxxxHASHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'kasir'),
                                                         ('Eko Prasetyo',   'gudang01', '$2b$10$xxxxxHASHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'gudang');

-- >> Master barang contoh
INSERT INTO barang (nama_barang, kategori) VALUES
                                               ('Indomie Goreng',      'Mie Instan'),
                                               ('Bimoli 2L',           'Minyak Goreng'),
                                               ('Gula Pasir',          'Sembako'),
                                               ('Rinso Bubuk',         'Detergen'),
                                               ('Aqua 600ml',          'Minuman');

-- >> Satuan barang contoh
INSERT INTO satuan_barang (id_barang, nama_satuan, harga_satuan, stok_satuan) VALUES
                                                                                  -- Indomie Goreng
                                                                                  (1, 'Dus',  115000, 50),
                                                                                  (1, 'Pak',   14500, 200),
                                                                                  -- Bimoli 2L
                                                                                  (2, 'Karton', 280000, 30),
                                                                                  (2, 'Botol',   38000, 150),
                                                                                  -- Gula Pasir
                                                                                  (3, 'Karung',  780000, 20),
                                                                                  (3, 'Kg',       15500, 400),
                                                                                  -- Rinso Bubuk
                                                                                  (4, 'Karton',  210000, 25),
                                                                                  (4, 'Pak',      27000, 100),
                                                                                  -- Aqua 600ml
                                                                                  (5, 'Dus',   45000, 80),
                                                                                  (5, 'Botol',   3500, 500);

-- >> Contoh transaksi penjualan
INSERT INTO penjualan (no_nota_jual, tanggal_jual, id_pegawai) VALUES
                                                                   ('TRX-20260701-001', '2026-07-01 09:15:00+07', 1),
                                                                   ('TRX-20260701-002', '2026-07-01 10:30:00+07', 2);

-- >> Detail penjualan (trigger akan memotong stok otomatis)
INSERT INTO detail_penjualan (no_nota_jual, id_satuan, jumlah_jual, subtotal_jual) VALUES
                                                                                       -- Nota 001: 3 Dus Indomie + 2 Botol Bimoli
                                                                                       ('TRX-20260701-001', 1,  3,  345000),  -- 3 x 115000
                                                                                       ('TRX-20260701-001', 4,  2,   76000),  -- 2 x 38000
                                                                                       -- Nota 002: 5 Kg Gula + 1 Pak Rinso + 10 Botol Aqua
                                                                                       ('TRX-20260701-002', 6,  5,   77500),  -- 5 x 15500
                                                                                       ('TRX-20260701-002', 8,  1,   27000),  -- 1 x 27000
                                                                                       ('TRX-20260701-002', 10, 10,  35000);  -- 10 x 3500
