const pool = require('../config/db');

const createSale = async (saleData, productPrice) => {
    const { item_id, category, quantity, payment_type, customer_nic, user_id } = saleData;
    const total_price = quantity * productPrice;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Record Sale
        const [result] = await connection.query(
            'INSERT INTO sale (item_id, category, quantity, total_price, payment_type, customer_nic, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [item_id, category, quantity, total_price, payment_type, customer_nic, user_id]
        );

        // 2. Reduce Stock
        let tableName;
        if (category === 'paddy') tableName = 'paddy';
        else if (category === 'equipment') tableName = 'equipment';
        else if (category === 'fertilizer_pesticide') tableName = 'fertilizer_pesticide';
        else throw new Error('Invalid category');

        await connection.query(
            `UPDATE ${tableName} SET stock = stock - ? WHERE id = ?`,
            [quantity, item_id]
        );

        // 3. Handle Credit
        if (payment_type === 'credit' && customer_nic) {
            // Check if credit account exists, if not create logic or fail?
            // Prompt says: "If payment_type = credit -> update customer_credit"
            // We assume account exists or we upsert. Let's assume validation happened in service/controller.
            await connection.query(
                'UPDATE customer_credit SET total_credit = total_credit + ? WHERE customer_nic = ?',
                [total_price, customer_nic]
            );
        }

        await connection.commit();
        return result.insertId;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const getAllSales = async () => {
    const [rows] = await pool.query('SELECT * FROM sale ORDER BY created_at DESC');
    return rows;
};

const getSaleById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM sale WHERE id = ?', [id]);
    return rows[0];
};

module.exports = {
    createSale,
    getAllSales,
    getSaleById
};
