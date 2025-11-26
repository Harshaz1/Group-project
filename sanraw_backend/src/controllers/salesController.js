const salesService = require('../services/salesService');

const createSale = async (req, res) => {
    try {
        const { item_id, category, quantity, payment_type, customer_nic } = req.body;
        const user_id = req.user.id;

        if (!item_id || !category || !quantity || !payment_type) {
            return res.status(400).json({ message: 'Item, Category, Quantity, and Payment Type are required' });
        }

        await salesService.createSale({ item_id, category, quantity, payment_type, customer_nic, user_id });
        res.status(201).json({ message: 'Sale recorded successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getAllSales = async (req, res) => {
    try {
        const sales = await salesService.getAllSales();
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSaleById = async (req, res) => {
    try {
        const sale = await salesService.getSaleById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createSale,
    getAllSales,
    getSaleById
};
