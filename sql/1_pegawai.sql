-- ============================================================
-- 1. TABEL PEGAWAI
--    Menyimpan data semua pengguna sistem beserta role-nya.
--    Role yang diizinkan: 'kasir' atau 'gudang'
-- ============================================================
CREATE TABLE pegawai (
                         id_pegawai  SERIAL          PRIMARY KEY,
                         nama        VARCHAR(100)    NOT NULL,
                         username    VARCHAR(50)     NOT NULL UNIQUE,
                         password    VARCHAR(255)    NOT NULL,   -- simpan sebagai hash (bcrypt)
                         role        VARCHAR(10)     NOT NULL,
                         created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

                         CONSTRAINT chk_role CHECK (role IN ('kasir', 'gudang'))
);

COMMENT ON TABLE  pegawai             IS 'Data akun seluruh pegawai sistem (kasir & gudang)';
COMMENT ON COLUMN pegawai.password    IS 'Password disimpan dalam bentuk hash, bukan plain-text';
COMMENT ON COLUMN pegawai.role        IS 'Nilai yang diizinkan: kasir | gudang';

