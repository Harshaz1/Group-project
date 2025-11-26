const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
};

async function runMigration() {
    let connection;
    try {
        console.log("Connecting to database...");
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected.");

        // Check if columns exist
        const [columns] = await connection.query("SHOW COLUMNS FROM user");
        const columnNames = columns.map(c => c.Field);

        const queries = [];

        if (!columnNames.includes('recovery_email')) {
            console.log("Adding recovery_email column...");
            queries.push("ALTER TABLE user ADD COLUMN recovery_email VARCHAR(255) DEFAULT NULL");
        } else {
            console.log("recovery_email column already exists.");
        }

        if (!columnNames.includes('status')) {
            console.log("Adding status column...");
            queries.push("ALTER TABLE user ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'");
        } else {
            console.log("status column already exists.");
        }

        for (const query of queries) {
            await connection.query(query);
            console.log("Executed:", query);
        }

        console.log("Migration completed successfully.");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        if (connection) await connection.end();
    }
}

runMigration();
