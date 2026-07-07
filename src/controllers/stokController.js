import { supabase } from '../config/supabase.js';

// GET /stok
export const getStokRealtime = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('v_stok_barang')
            .select('*')
            // Bisa tambah logic filtering pakai req.query di sini
            .order('nama_barang', { ascending: true });

        if (error) throw error;
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};