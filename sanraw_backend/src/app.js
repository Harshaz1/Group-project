// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Import DB connection
const db = require('./config/db'); // Make sure you have db.js exporting a mysql2/promise pool

// Config
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const paddyRoutes = require('./routes/paddyRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const chemicalRoutes = require('./routes/chemicalRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
const creditRoutes = require('./routes/creditRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const billRoutes = require('./routes/billRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/paddy', paddyRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/chemicals', chemicalRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/sales', salesRoutes);
app.use('/credit', creditRoutes);
app.use('/reports', reportsRoutes);
app.use('/bills', billRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/purchases', purchaseRoutes);


// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Sanraw Backend is Running' });
});

// DB Connection Test Endpoint
app.get('/test-db', async (req, res) => {
    try {
        // Simple query to test connection
        const [rows] = await db.query('SELECT 1 AS connected');
        if (rows && rows[0].connected === 1) {
            res.json({ dbConnected: true, message: 'Database connection successful!' });
        } else {
            res.status(500).json({ dbConnected: false, message: 'Database connection failed!' });
        }
    } catch (err) {
        console.error('DB Connection Error:', err.message);
        res.status(500).json({ dbConnected: false, error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
