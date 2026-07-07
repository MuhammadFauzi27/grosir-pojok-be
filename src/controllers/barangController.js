import pool from '../config/database.js';

// GET /barang
export const getBarang = async (req, res, next) => {
  try {
    const { search, kategori, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`nama_barang ILIKE $${idx++}`);
      values.push(`%${search}%`);
    }
    if (kategori) {
      conditions.push(`kategori = $${idx++}`);
      values.push(kategori);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(parseInt(limit, 10), offset);

    const sql = `
      SELECT id_barang, nama_barang, kategori, created_at
      FROM barang
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    const { rows } = await pool.query(sql, values);
    res.status(200).json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /barang/:id_barang/satuan
export const getSatuanByBarang = async (req, res, next) => {
  try {
    const { id_barang } = req.params;
    const sql = `
      SELECT id_satuan, id_barang, nama_satuan, harga_satuan, stok_satuan, created_at
      FROM satuan_barang
      WHERE id_barang = $1
      ORDER BY nama_satuan
    `;
    const { rows } = await pool.query(sql, [id_barang]);
    res.status(200).json({ data: rows });
  } catch (err) {
    next(err);
  }
};