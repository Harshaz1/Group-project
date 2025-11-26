const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
};

async function apply() {
    let connection;
    try {
        console.log("Connecting...");
        connection = await mysql.createConnection(dbConfig);
        console.log("Applying: ALTER TABLE bill MODIFY customer_name VARCHAR(255) NULL;");
        await connection.query("ALTER TABLE bill MODIFY customer_name VARCHAR(255) NULL");
        console.log("Migration applied successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        if (connection) await connection.end();
    }
}

apply();
