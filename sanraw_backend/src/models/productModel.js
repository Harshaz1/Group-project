const pool = require('../config/db');

const createProduct = async (productData) => {
    const { category, name, unit_price, stock_quantity } = productData;
    const [result] = await pool.query(
        'INSERT INTO product (category, name, unit_price, stock_quantity) VALUES (?, ?, ?, ?)',
        [category, name, unit_price, stock_quantity || 0]
    );
    return result.insertId;
};

const getAllProducts = async () => {
    const [rows] = await pool.query('SELECT * FROM product');
    return rows;
};

const getProductById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM product WHERE id = ?', [id]);
    return rows[0];
};

const updateProduct = async (id, productData) => {
    const { category, name, unit_price, stock_quantity } = productData;
    await pool.query(
        'UPDATE product SET category = ?, name = ?, unit_price = ?, stock_quantity = ? WHERE id = ?',
        [category, name, unit_price, stock_quantity, id]
    );
};

const deleteProduct = async (id) => {
    await pool.query('DELETE FROM product WHERE id = ?', [id]);
};

// Update stock (internal use)
const updateStock = async (id, quantityChange) => {
    // quantityChange can be positive (add) or negative (subtract)
    await pool.query('UPDATE product SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantityChange, id]);
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateStock
};
