const pool = require('../config/db');

const createCreditAccount = async (customer_nic) => {
    await pool.query(
        'INSERT INTO customer_credit (customer_nic, total_credit) VALUES (?, 0)',
        [customer_nic]
    );
};

const getCreditByNIC = async (nic) => {
    const [rows] = await pool.query('SELECT * FROM customer_credit WHERE customer_nic = ?', [nic]);
    return rows[0];
};

const recordPayment = async (paymentData) => {
    const { customer_nic, amount, user_id } = paymentData;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Record Payment
        await connection.query(
            'INSERT INTO credit_payment (customer_nic, amount, user_id) VALUES (?, ?, ?)',
            [customer_nic, amount, user_id]
        );

        // 2. Reduce Customer Credit
        await connection.query(
            'UPDATE customer_credit SET total_credit = total_credit - ? WHERE customer_nic = ?',
            [amount, customer_nic]
        );

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

module.exports = {
    createCreditAccount,
    getCreditByNIC,
    recordPayment
};
