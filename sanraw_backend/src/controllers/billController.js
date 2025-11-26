const billModel = require('../models/billModel');

const createBill = async (req, res) => {
    try {
        const { billData, items } = req.body;

        if (!billData || !items || items.length === 0) {
            return res.status(400).json({ message: 'Bill data and items are required' });
        }

        // Add user_id from authenticated user
        billData.user_id = req.user.id;

        const billId = await billModel.createBill(billData, items);
        res.status(201).json({ message: 'Bill created successfully', billId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllBills = async (req, res) => {
    try {
        const bills = await billModel.getAllBills();
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getBillById = async (req, res) => {
    try {
        const bill = await billModel.getBillById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getBillsByPaymentType = async (req, res) => {
    try {
        const bills = await billModel.getBillsByPaymentType(req.params.type);
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getBillsByUser = async (req, res) => {
    try {
        const bills = await billModel.getBillsByUser(req.params.userId);
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteBill = async (req, res) => {
    try {
        const bill = await billModel.getBillById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        if (bill.is_expired) {
            return res.status(400).json({ message: 'Bill has expired and cannot be returned/deleted' });
        }

        await billModel.deleteBill(req.params.id);
        res.json({ message: 'Bill deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { is_paid } = req.body;
        await billModel.updatePaymentStatus(req.params.id, is_paid);
        res.json({ message: 'Payment status updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateBill = async (req, res) => {
    try {
        const bill = await billModel.getBillById(req.params.id);
        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        if (bill.is_expired) {
            return res.status(400).json({ message: 'Bill has expired and cannot be edited' });
        }

        const { billData, items } = req.body;
        await billModel.updateBill(req.params.id, billData, items);
        res.json({ message: 'Bill updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createBill,
    getAllBills,
    getBillById,
    getBillsByPaymentType,
    getBillsByUser,
    deleteBill,
    updatePaymentStatus,
    updateBill
};
