const purchaseService = require('../services/purchaseService');

const createPurchase = async (req, res) => {
    try {
        const { purchaseData, items } = req.body;
        const userId = req.user.id;
        const result = await purchaseService.createPurchase(purchaseData, items, userId);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPurchaseBills = async (req, res) => {
    try {
        const { type } = req.query; // cash or credit
        const bills = await purchaseService.getPurchaseBills(type);
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPurchaseBillById = async (req, res) => {
    try {
        const bill = await purchaseService.getPurchaseBillById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createPurchase,
    getPurchaseBills,
    getPurchaseBillById
};
