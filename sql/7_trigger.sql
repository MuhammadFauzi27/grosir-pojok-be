-- ============================================================
-- 7. TRIGGER: PEMOTONGAN STOK OTOMATIS
--    Setiap INSERT ke detail_penjualan akan langsung mengurangi
--    jumlah_stok di tabel stok (berdasarkan id_barang).
--    Jika stok tidak cukup, transaksi DIBATALKAN (RAISE EXCEPTION).
-- ============================================================
CREATE OR REPLACE FUNCTION fn_potong_stok()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_stok_sekarang INT;
BEGIN
    -- Kunci baris stok agar aman dari race condition
    SELECT jumlah_stok
    INTO   v_stok_sekarang
    FROM   stok
    WHERE  id_barang = NEW.id_barang
    FOR UPDATE;

    IF v_stok_sekarang IS NULL THEN
        RAISE EXCEPTION
            'Data stok tidak ditemukan untuk id_barang=%', NEW.id_barang;
    END IF;

    IF v_stok_sekarang < NEW.jumlah_per_barang THEN
        RAISE EXCEPTION
            'Stok tidak mencukupi untuk id_barang=%. Stok tersedia: %, diminta: %',
            NEW.id_barang, v_stok_sekarang, NEW.jumlah_per_barang;
    END IF;

    UPDATE stok
    SET    jumlah_stok = jumlah_stok - NEW.jumlah_per_barang
    WHERE  id_barang   = NEW.id_barang;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_potong_stok
    AFTER INSERT ON detail_penjualan
    FOR EACH ROW
    EXECUTE FUNCTION fn_potong_stok();

COMMENT ON FUNCTION fn_potong_stok() IS
    'Dipanggil otomatis setiap item penjualan di-insert; memotong jumlah_stok di tabel stok secara real-time';
