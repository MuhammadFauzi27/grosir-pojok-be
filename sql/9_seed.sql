-- ============================================================
-- 9. DATA AWAL (SEED)
-- ============================================================

-- >> Pegawai contoh
INSERT INTO pegawai (nama, username, password, role) VALUES
    ('Budi Santoso',   'kasir01',  'kasir01',  'kasir'),
    ('Dian Rahayu',    'kasir02',  'kasir02',  'kasir'),
    ('Eko Prasetyo',   'gudang01', 'gudang01', 'gudang');

-- >> Master satuan barang (tetap, tidak dapat diubah via API)
INSERT INTO satuan_barang (nama_satuan) VALUES
    ('pcs'),
    ('lusin'),
    ('dus'),
    ('pak'),
    ('karton'),
    ('liter'),
    ('ml'),
    ('gram'),
    ('kg'),
    ('botol');

-- -- >> Master barang contoh
-- INSERT INTO barang (nama_barang, kategori, harga_barang, id_satuan) VALUES
--     ('Indomie Goreng Dus',  'Mie Instan',    42000,  (SELECT id_satuan FROM satuan_barang WHERE nama_satuan = 'dus')),
--     ('Indomie Goreng Pcs',  'Mie Instan',     3500,  (SELECT id_satuan FROM satuan_barang WHERE nama_satuan = 'pcs')),
--     ('Bimoli 2L',           'Minyak Goreng', 38000,  (SELECT id_satuan FROM satuan_barang WHERE nama_satuan = 'liter')),
--     ('Gula Pasir',          'Sembako',       15500,  (SELECT id_satuan FROM satuan_barang WHERE nama_satuan = 'kg')),
--     ('Rinso Bubuk',         'Detergen',      27000,  (SELECT id_satuan FROM satuan_barang WHERE nama_satuan = 'pak')),
--     ('Aqua 600ml',          'Minuman',        3500,  (SELECT id_satuan FROM satuan_barang WHERE nama_satuan = 'ml'));

-- -- >> Stok awal per barang
-- INSERT INTO stok (id_barang, jumlah_stok) VALUES
--     (1, 500),
--     (2, 800),
--     (3, 150),
--     (4, 400),
--     (5, 200),
--     (6, 1000);
