const chemicalService = require('../models/chemicalModel');

const createChemical = async (req, res) => {
    try {
        const { name, price, expire_date, stock } = req.body;
        if (!name || !price || !expire_date) {
            return res.status(400).json({ message: 'Name, price, and expire date are required' });
        }
        await chemicalService.createChemical({ name, price, expire_date, stock: stock || 0 });
        res.status(201).json({ message: 'Item created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllChemicals = async (req, res) => {
    try {
        const items = await chemicalService.getAllChemicals();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getChemicalById = async (req, res) => {
    try {
        const item = await chemicalService.getChemicalById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateChemical = async (req, res) => {
    try {
        const { name, price, expire_date, stock } = req.body;
        await chemicalService.updateChemical(req.params.id, { name, price, expire_date, stock });
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteChemical = async (req, res) => {
    try {
        await chemicalService.deleteChemical(req.params.id);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createChemical,
    getAllChemicals,
    getChemicalById,
    updateChemical,
    deleteChemical
};
