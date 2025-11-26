const inventoryService = require('../services/inventoryService');

const addPurchase = async (req, res) => {
    try {
        const { item_id, category, quantity, buy_price, payment_type } = req.body;
        if (!item_id || !category || !quantity || !buy_price || !payment_type) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        await inventoryService.addPurchase(req.body);
        res.status(201).json({ message: 'Purchase recorded and stock updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllPurchases = async (req, res) => {
    try {
        const purchases = await inventoryService.getAllPurchases();
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    addPurchase,
    getAllPurchases
};
