import { supabase } from '../config/supabase.js';

// POST /penjualan
export const catatPenjualan = async (req, res) => {
    const { id_pegawai, items } = req.body;
    let insertedNota = null;

    try {
        // 1. Bikin Header Penjualan dulu
        // no_nota_jual bisa di-generate otomatis oleh DB atau dari Express
        const { data: headerData, error: headerError } = await supabase
            .from('penjualan')
            .insert([{ id_pegawai }])
            .select()
            .single();

        if (headerError) throw headerError;
        insertedNota = headerData.no_nota_jual;

        // 2. Siapkan data detail untuk di-insert sekaligus (Bulk Insert)
        const detailPenjualan = items.map(item => ({
            no_nota_jual: insertedNota,
            id_satuan: item.id_satuan,
            jumlah_jual: item.jumlah_jual
            // subtotal_jual dihitung otomatis di DB atau disiapkan di sini jika pakai logic Express
        }));

        // 3. Insert Detail (Ini yang akan men-trigger pemotongan stok di PostgreSQL)
        const { error: detailError } = await supabase
            .from('detail_penjualan')
            .insert(detailPenjualan);

        // Jika stok tidak cukup, trigger DB akan melempar error di tahap ini
        if (detailError) throw detailError;

        res.status(201).json({ message: "Transaksi berhasil", no_nota: insertedNota });

    } catch (error) {
        // MANUAL ROLLBACK: Jika insert detail gagal (misal stok kurang), hapus headernya!
        if (insertedNota) {
            await supabase.from('penjualan').delete().eq('no_nota_jual', insertedNota);
        }
        res.status(409).json({ error: "Transaksi dibatalkan", message: error.message });
    }
};