-- ============================================================
-- 5. TABEL DETAIL_PENJUALAN
--    Baris item dalam setiap nota penjualan.
--    subtotal_jual = jumlah_jual x harga_satuan (saat transaksi)
-- ============================================================
CREATE TABLE detail_penjualan (
                                  id_detail_jual  SERIAL          PRIMARY KEY,
                                  no_nota_jual    VARCHAR(30)     NOT NULL,
                                  id_satuan       INT             NOT NULL,
                                  jumlah_jual     INT             NOT NULL CHECK (jumlah_jual > 0),
                                  subtotal_jual   NUMERIC(15,2)   NOT NULL CHECK (subtotal_jual >= 0),

                                  CONSTRAINT fk_detail_nota
                                      FOREIGN KEY (no_nota_jual) REFERENCES penjualan (no_nota_jual)
                                          ON UPDATE CASCADE ON DELETE CASCADE,

                                  CONSTRAINT fk_detail_satuan
                                      FOREIGN KEY (id_satuan) REFERENCES satuan_barang (id_satuan)
                                          ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Satu nota tidak boleh memuat satuan yang sama lebih dari sekali
                                  CONSTRAINT uq_item_per_nota UNIQUE (no_nota_jual, id_satuan)
);

COMMENT ON TABLE  detail_penjualan              IS 'Item baris setiap nota penjualan';
COMMENT ON COLUMN detail_penjualan.subtotal_jual IS 'Snapshot harga x jumlah saat transaksi terjadi';
