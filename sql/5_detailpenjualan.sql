-- ============================================================
-- 5. TABEL DETAIL_PENJUALAN
--    Baris item dalam setiap nota penjualan (relasi Memuat).
--    subtotal_jual = jumlah_per_barang x harga_barang (snapshot saat transaksi)
-- ============================================================
CREATE TABLE detail_penjualan (
    id_detail_jual   SERIAL          PRIMARY KEY,
    no_nota          VARCHAR(30)     NOT NULL,
    id_barang        INT             NOT NULL,
    jumlah_per_barang INT            NOT NULL CHECK (jumlah_per_barang > 0),
    subtotal_jual    NUMERIC(15,2)   NOT NULL CHECK (subtotal_jual >= 0),

    CONSTRAINT fk_detail_nota
        FOREIGN KEY (no_nota) REFERENCES penjualan (no_nota)
            ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_detail_barang
        FOREIGN KEY (id_barang) REFERENCES barang (id_barang)
            ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Satu nota tidak boleh memuat barang yang sama lebih dari sekali
    CONSTRAINT uq_item_per_nota UNIQUE (no_nota, id_barang)
);

COMMENT ON TABLE  detail_penjualan                   IS 'Item baris setiap nota penjualan (relasi Memuat)';
COMMENT ON COLUMN detail_penjualan.jumlah_per_barang IS 'Jumlah barang yang dibeli dalam satu transaksi';
COMMENT ON COLUMN detail_penjualan.subtotal_jual     IS 'Snapshot harga x jumlah saat transaksi terjadi';
