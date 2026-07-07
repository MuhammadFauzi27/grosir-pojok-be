import { supabase } from '../config/supabase.js';

// GET /barang
export const getBarang = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('barang')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /barang/:id_barang/satuan
export const getSatuanByBarang = async (req, res) => {
    try {
        const { id_barang } = req.params;
        const { data, error } = await supabase
            .from('satuan_barang')
            .select('*')
            .eq('id_barang', id_barang);

        if (error) throw error;
        res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};