const pool = require('../config/db');

const createEquipment = async (data) => {
    const { equipment_name, price, stock } = data;
    const [result] = await pool.query(
        'INSERT INTO equipment (equipment_name, price, stock) VALUES (?, ?, ?)',
        [equipment_name, price, stock]
    );
    return result.insertId;
};

const getAllEquipment = async () => {
    const [rows] = await pool.query('SELECT * FROM equipment');
    return rows;
};

const getEquipmentById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM equipment WHERE id = ?', [id]);
    return rows[0];
};

const updateEquipment = async (id, data) => {
    const { equipment_name, price, stock } = data;
    await pool.query(
        'UPDATE equipment SET equipment_name = ?, price = ?, stock = ? WHERE id = ?',
        [equipment_name, price, stock, id]
    );
};

const deleteEquipment = async (id) => {
    await pool.query('DELETE FROM equipment WHERE id = ?', [id]);
};

// Update stock (internal use)
const updateStock = async (id, quantityChange) => {
    await pool.query('UPDATE equipment SET stock = stock + ? WHERE id = ?', [quantityChange, id]);
};

module.exports = {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
    updateStock
};
