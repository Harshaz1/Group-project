const pool = require('../config/db');

const createPaddy = async (data) => {
    const { paddy_name, price, stock } = data;
    const [result] = await pool.query(
        'INSERT INTO paddy (paddy_name, price, stock) VALUES (?, ?, ?)',
        [paddy_name, price, stock]
    );
    return result.insertId;
};

const getAllPaddy = async () => {
    const [rows] = await pool.query('SELECT * FROM paddy');
    return rows;
};

const getPaddyById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM paddy WHERE id = ?', [id]);
    return rows[0];
};

const updatePaddy = async (id, data) => {
    const { paddy_name, price, stock } = data;
    await pool.query(
        'UPDATE paddy SET paddy_name = ?, price = ?, stock = ? WHERE id = ?',
        [paddy_name, price, stock, id]
    );
};

const deletePaddy = async (id) => {
    await pool.query('DELETE FROM paddy WHERE id = ?', [id]);
};

// Update stock (internal use)
const updateStock = async (id, quantityChange) => {
    await pool.query('UPDATE paddy SET stock = stock + ? WHERE id = ?', [quantityChange, id]);
};

module.exports = {
    createPaddy,
    getAllPaddy,
    getPaddyById,
    updatePaddy,
    deletePaddy,
    updateStock
};
