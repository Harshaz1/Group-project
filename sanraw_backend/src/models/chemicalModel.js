const pool = require('../config/db');

const createChemical = async (data) => {
    const { name, price, expire_date, stock } = data;
    const [result] = await pool.query(
        'INSERT INTO fertilizer_pesticide (name, price, expire_date, stock) VALUES (?, ?, ?, ?)',
        [name, price, expire_date, stock]
    );
    return result.insertId;
};

const getAllChemicals = async () => {
    const [rows] = await pool.query('SELECT * FROM fertilizer_pesticide');
    return rows;
};

const getChemicalById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM fertilizer_pesticide WHERE id = ?', [id]);
    return rows[0];
};

const updateChemical = async (id, data) => {
    const { name, price, expire_date, stock } = data;
    await pool.query(
        'UPDATE fertilizer_pesticide SET name = ?, price = ?, expire_date = ?, stock = ? WHERE id = ?',
        [name, price, expire_date, stock, id]
    );
};

const deleteChemical = async (id) => {
    await pool.query('DELETE FROM fertilizer_pesticide WHERE id = ?', [id]);
};

// Update stock (internal use)
const updateStock = async (id, quantityChange) => {
    await pool.query('UPDATE fertilizer_pesticide SET stock = stock + ? WHERE id = ?', [quantityChange, id]);
};

module.exports = {
    createChemical,
    getAllChemicals,
    getChemicalById,
    updateChemical,
    deleteChemical,
    updateStock
};
