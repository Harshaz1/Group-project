const paddyService = require('../models/paddyModel'); // Using model directly as service for simple CRUD

const createPaddy = async (req, res) => {
    try {
        const { paddy_name, price, stock } = req.body;
        if (!paddy_name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }
        await paddyService.createPaddy({ paddy_name, price, stock: stock || 0 });
        res.status(201).json({ message: 'Paddy inventory created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllPaddy = async (req, res) => {
    try {
        const paddy = await paddyService.getAllPaddy();
        res.json(paddy);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPaddyById = async (req, res) => {
    try {
        const paddy = await paddyService.getPaddyById(req.params.id);
        if (!paddy) return res.status(404).json({ message: 'Paddy not found' });
        res.json(paddy);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updatePaddy = async (req, res) => {
    try {
        const { paddy_name, price, stock } = req.body;
        await paddyService.updatePaddy(req.params.id, { paddy_name, price, stock });
        res.json({ message: 'Paddy updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deletePaddy = async (req, res) => {
    try {
        await paddyService.deletePaddy(req.params.id);
        res.json({ message: 'Paddy deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createPaddy,
    getAllPaddy,
    getPaddyById,
    updatePaddy,
    deletePaddy
};
