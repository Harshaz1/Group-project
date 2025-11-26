const pool = require('../config/db');

const createPurchase = async (purchaseData, items, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { bill_number, supplier_id, payment_type, total_price, net_price } = purchaseData;

        // 1. Save purchase_bill
        const [billResult] = await connection.query(
            'INSERT INTO purchase_bill (bill_number, supplier_id, payment_type, total_price, net_price, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [bill_number, supplier_id, payment_type, total_price, net_price, userId]
        );
        const purchaseBillId = billResult.insertId;

        // 2. Save items and update stock
        for (const item of items) {
            const { item_id, category, product_name, quantity, buy_price, ext_price } = item;

            // Save purchase_bill_items
            await connection.query(
                'INSERT INTO purchase_bill_items (purchase_bill_id, item_id, category, product_name, quantity, buy_price, ext_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [purchaseBillId, item_id, category, product_name, quantity, buy_price, ext_price]
            );

            // Update Stock (Real-time)
            let tableName = '';
            let idField = 'id';
            if (category === 'paddy') tableName = 'paddy';
            else if (category === 'equipment') tableName = 'equipment';
            else if (category === 'fertilizer_pesticide') tableName = 'fertilizer_pesticide';

            if (tableName) {
                await connection.query(
                    `UPDATE ${tableName} SET stock = stock + ? WHERE ${idField} = ?`,
                    [quantity, item_id]
                );
            }
        }

        await connection.commit();
        return { id: purchaseBillId, bill_number };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

const getPurchaseBills = async (paymentType) => {
    let query = `
        SELECT pb.*, s.name as supplier_name 
        FROM purchase_bill pb 
        JOIN supplier s ON pb.supplier_id = s.id
    `;
    const params = [];

    if (paymentType) {
        query += ' WHERE pb.payment_type = ?';
        params.push(paymentType);
    }

    query += ' ORDER BY pb.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
};

const getPurchaseBillById = async (id) => {
    const [bill] = await pool.query(`
        SELECT pb.*, s.name as supplier_name, s.address as supplier_address, s.phone as supplier_phone
        FROM purchase_bill pb
        JOIN supplier s ON pb.supplier_id = s.id
        WHERE pb.id = ?
    `, [id]);

    if (bill.length === 0) return null;

    const [items] = await pool.query('SELECT * FROM purchase_bill_items WHERE purchase_bill_id = ?', [id]);

    return { ...bill[0], items };
};

module.exports = {
    createPurchase,
    getPurchaseBills,
    getPurchaseBillById
};
