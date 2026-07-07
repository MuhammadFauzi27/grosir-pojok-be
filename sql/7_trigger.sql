-- ============================================================
-- 7. TRIGGER: PEMOTONGAN STOK OTOMATIS
--    Setiap INSERT ke detail_penjualan akan langsung mengurangi
--    stok di tabel satuan_barang (sesuai kebutuhan fungsional 3.5).
--    Jika stok tidak cukup, transaksi DIBATALKAN (RAISE EXCEPTION).
-- ============================================================
CREATE OR REPLACE FUNCTION fn_potong_stok()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
v_stok_sekarang INT;
BEGIN
    -- Kunci baris satuan_barang agar aman dari race condition
SELECT stok_satuan
INTO   v_stok_sekarang
FROM   satuan_barang
WHERE  id_satuan = NEW.id_satuan
    FOR UPDATE;

IF v_stok_sekarang < NEW.jumlah_jual THEN
        RAISE EXCEPTION
            'Stok tidak mencukupi untuk id_satuan=%. Stok tersedia: %, diminta: %',
            NEW.id_satuan, v_stok_sekarang, NEW.jumlah_jual;
END IF;

UPDATE satuan_barang
SET    stok_satuan = stok_satuan - NEW.jumlah_jual
WHERE  id_satuan   = NEW.id_satuan;

RETURN NEW;
END;
$$;

CREATE TRIGGER trg_potong_stok
    AFTER INSERT ON detail_penjualan
    FOR EACH ROW
    EXECUTE FUNCTION fn_potong_stok();

COMMENT ON FUNCTION fn_potong_stok() IS
    'Dipanggil otomatis setiap item penjualan di-insert; memotong stok_satuan secara real-time';
