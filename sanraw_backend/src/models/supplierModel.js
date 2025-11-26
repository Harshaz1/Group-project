const pool = require('../config/db');

const getAllSuppliers = async () => {
    const [rows] = await pool.query('SELECT * FROM supplier ORDER BY name');
    return rows;
};

const getSupplierById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM supplier WHERE id = ?', [id]);
    return rows[0];
};

const createSupplier = async (supplierData) => {
    const { name, address, phone } = supplierData;
    const [result] = await pool.query(
        'INSERT INTO supplier (name, address, phone) VALUES (?, ?, ?)',
        [name, address, phone]
    );
    return { id: result.insertId, ...supplierData };
};

const updateSupplier = async (id, supplierData) => {
    const { name, address, phone } = supplierData;
    await pool.query(
        'UPDATE supplier SET name = ?, address = ?, phone = ? WHERE id = ?',
        [name, address, phone, id]
    );
    return { id, ...supplierData };
};

const deleteSupplier = async (id) => {
    await pool.query('DELETE FROM supplier WHERE id = ?', [id]);
    return { id };
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
