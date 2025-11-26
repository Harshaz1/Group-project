const pool = require('../config/db');

const addPurchase = async (purchaseData) => {
    const { item_id, category, quantity, buy_price, payment_type } = purchaseData;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Record Purchase
        const [result] = await connection.query(
            'INSERT INTO inventory_purchase (item_id, category, quantity, buy_price, payment_type) VALUES (?, ?, ?, ?, ?)',
            [item_id, category, quantity, buy_price, payment_type]
        );

        // 2. Update Product Stock (Increase)
        let tableName;
        if (category === 'paddy') tableName = 'paddy';
        else if (category === 'equipment') tableName = 'equipment';
        else if (category === 'fertilizer_pesticide') tableName = 'fertilizer_pesticide';
        else throw new Error('Invalid category');

        // Note: Safe to inject tableName because it's strictly validated above
        await connection.query(
            `UPDATE ${tableName} SET stock = stock + ? WHERE id = ?`,
            [quantity, item_id]
        );

        await connection.commit();
        return result.insertId;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const getAllPurchases = async () => {
    const [rows] = await pool.query('SELECT * FROM inventory_purchase');
    return rows;
};

module.exports = {
    addPurchase,
    getAllPurchases
};
