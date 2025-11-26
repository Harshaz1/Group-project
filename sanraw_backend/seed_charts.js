const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '2000iclAB/',
            database: process.env.DB_NAME || 'sanraw_db'
        });
        console.log('Connected!');

        // 1. Seed Product Stock (Inventory)
        console.log('Seeding Products...');
        // Ensure some products exist or update them
        await connection.query(`
            UPDATE product SET stock_quantity = 50, unit_price = 2500 WHERE product_name LIKE '%Urea%' OR id = 1;
        `);
        await connection.query(`
             UPDATE product SET stock_quantity = 30, unit_price = 4500 WHERE product_name LIKE '%Compost%' OR id = 2;
        `);
        // If empty, insert dummy
        const [products] = await connection.query('SELECT * FROM product');
        if (products.length === 0) {
            await connection.query(`
                INSERT INTO product (product_name, category, stock_quantity, unit_price, supplier_name) VALUES 
                ('Urea 50kg', 'Fertilizer', 100, 2500, 'AgroSup'),
                ('Weed Killer X', 'Chemical', 50, 1200, 'ChemCo')
            `);
        }

        // 2. Seed Paddy Stock
        console.log('Seeding Paddy...');
        const [paddies] = await connection.query('SELECT * FROM paddy');
        if (paddies.length === 0) {
            await connection.query(`
                INSERT INTO paddy (paddy_name, type, price, stock) VALUES 
                ('Keeri Samba', 'Samba', 120, 5000),
                ('Nadu', 'Nadu', 95, 8000),
                ('Sudu Kekulu', 'Kekulu', 85, 3000)
            `);
        } else {
            await connection.query('UPDATE paddy SET stock = stock + 1000 WHERE stock < 100');
        }

        // 3. Seed Sales (Bills) for Current Month
        console.log('Seeding Sales...');
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // Delete existing dummy bills if any (optional, but good for clean chart)
        // await connection.query("DELETE FROM bill WHERE customer_name = 'Seeded Customer'");

        const days = [1, 3, 5, 8, 10, 12, 15, 17, 18]; // Dates in this month

        for (const day of days) {
            const dateStr = `${currentYear}-${currentMonth}-${day} 10:00:00`;
            const amount = Math.floor(Math.random() * 40000) + 5000; // 5k to 45k

            await connection.query(`
                INSERT INTO bill (customer_name, customer_phone, total_price, net_price, payment_type, is_paid, created_at)
                VALUES ('Seeded Customer', '0771234567', ?, ?, 'cash', 1, ?)
            `, [amount, amount, dateStr]);
        }

        console.log('Seeding Complete! Check your Dashboard.');

    } catch (err) {
        console.error('Seeding Failed:', err);
    } finally {
        if (connection) await connection.end();
    }
};

seedData();
