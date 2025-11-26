const pool = require('../config/db');

const getDailySales = async () => {
    // Use 'bill' table for daily sales
    const [rows] = await pool.query(
        'SELECT * FROM bill WHERE DATE(created_at) = CURDATE() ORDER BY created_at DESC'
    );
    return rows;
};

const getSalesReport = async (startDate, endDate) => {
    let query = 'SELECT * FROM bill';
    const params = [];

    if (startDate && endDate) {
        query += ' WHERE DATE(created_at) BETWEEN ? AND ?';
        params.push(startDate, endDate);
    } else {
        // Default to current month if no dates provided
        query += ' WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())';
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
};

const getInventoryReport = async () => {
    // Combine all inventory tables
    const [paddy] = await pool.query('SELECT id, paddy_name as name, "Paddy" as category, stock, price, (stock * price) as value FROM paddy');
    const [chemicals] = await pool.query('SELECT id, name, "Chemicals" as category, stock, price, (stock * price) as value FROM fertilizer_pesticide');
    const [equipment] = await pool.query('SELECT id, equipment_name as name, "Equipment" as category, stock, price, (stock * price) as value FROM equipment');

    return [...paddy, ...chemicals, ...equipment];
};

const getCreditReport = async () => {
    // Aggregated Credit Report from 'bill' table
    // Group by customer to show total outstanding per customer
    const [rows] = await pool.query(`
        SELECT 
            customer_name, 
            customer_phone, 
            COUNT(id) as bill_count, 
            SUM(net_price) as total_credit, 
            MAX(created_at) as last_updated 
        FROM bill 
        WHERE payment_type = 'credit' AND is_paid = 0 
        GROUP BY customer_name, customer_phone 
        ORDER BY total_credit DESC
    `);
    return rows;
};

const getCreditPaymentReport = async (startDate, endDate) => {
    let query = `
        SELECT cp.*, u.first_name, u.last_name 
        FROM credit_payment cp
        JOIN user u ON cp.user_id = u.id
    `;
    const params = [];

    if (startDate && endDate) {
        query += ' WHERE DATE(cp.created_at) BETWEEN ? AND ?';
        params.push(startDate, endDate);
    }

    query += ' ORDER BY cp.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
};

const getPurchasesReport = async (startDate, endDate) => {
    let query = 'SELECT * FROM inventory_purchase';
    const params = [];

    if (startDate && endDate) {
        query += ' WHERE DATE(created_at) BETWEEN ? AND ?';
        params.push(startDate, endDate);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
};

// --- New Chart Queries ---

// Daily Sales Growth for Current Month
const getDailySalesGrowthEx = async () => {
    // Group by Date for current month
    // Using 'bill' table for sales data consistency
    const [rows] = await pool.query(`
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, SUM(net_price) as total 
        FROM bill 
        WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
          AND YEAR(created_at) = YEAR(CURRENT_DATE())
        GROUP BY date
        ORDER BY date ASC
    `);
    return rows;
};

// Paddy Stock Report
const getPaddyStockReport = async () => {
    const [rows] = await pool.query('SELECT paddy_name as name, stock as value FROM paddy');
    return rows;
};

// Inventory Summary (approximate distribution by category count/value)
const getInventorySummary = async () => {
    // Corrected to use existing specific tables instead of non-existent 'product' table
    const [paddy] = await pool.query('SELECT COUNT(*) as count, SUM(stock * price) as value FROM paddy');
    const [chemicals] = await pool.query('SELECT COUNT(*) as count, SUM(stock * price) as value FROM fertilizer_pesticide');
    const [equipment] = await pool.query('SELECT COUNT(*) as count, SUM(stock * price) as value FROM equipment');

    return [
        { name: 'Paddy', value: Number(paddy[0].value || 0) },
        { name: 'Chemicals', value: Number(chemicals[0].value || 0) },
        { name: 'Equipment', value: Number(equipment[0].value || 0) }
    ];
};

module.exports = {
    getDailySales,
    getSalesReport,
    getInventoryReport,
    getCreditReport,
    getCreditPaymentReport,
    getPurchasesReport,
    getDailySalesGrowthEx,
    getPaddyStockReport,
    getInventorySummary
};
