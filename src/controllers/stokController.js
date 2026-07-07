import pool from '../config/database.js';

// GET /stok
export const getStokRealtime = async (req, res, next) => {
  try {
    const { search, kategori, stok_menipis } = req.query;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(nama_barang ILIKE $${idx++} OR nama_satuan ILIKE $${idx - 1})`);
      values.push(`%${search}%`);
    }
    if (kategori) {
      conditions.push(`kategori = $${idx++}`);
      values.push(kategori);
    }
    // stok_menipis: tampilkan satuan dengan stok <= 10 (ambang batas minimum)
    if (stok_menipis === 'true') {
      conditions.push(`stok_satuan <= 10`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT id_barang, nama_barang, kategori, id_satuan, nama_satuan, harga_satuan, stok_satuan
      FROM v_stok_barang
      ${whereClause}
      ORDER BY nama_barang, nama_satuan
    `;

    const { rows } = await pool.query(sql, values);
    res.status(200).json({ data: rows });
  } catch (err) {
    next(err);
  }
};