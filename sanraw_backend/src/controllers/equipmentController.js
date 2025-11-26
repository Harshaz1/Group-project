const equipmentService = require('../models/equipmentModel');

const createEquipment = async (req, res) => {
    try {
        const { equipment_name, price, stock } = req.body;
        if (!equipment_name || !price) {
            return res.status(400).json({ message: 'Name and price are required' });
        }
        await equipmentService.createEquipment({ equipment_name, price, stock: stock || 0 });
        res.status(201).json({ message: 'Equipment created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAllEquipment = async (req, res) => {
    try {
        const equipment = await equipmentService.getAllEquipment();
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getEquipmentById = async (req, res) => {
    try {
        const equipment = await equipmentService.getEquipmentById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateEquipment = async (req, res) => {
    try {
        const { equipment_name, price, stock } = req.body;
        await equipmentService.updateEquipment(req.params.id, { equipment_name, price, stock });
        res.json({ message: 'Equipment updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteEquipment = async (req, res) => {
    try {
        await equipmentService.deleteEquipment(req.params.id);
        res.json({ message: 'Equipment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment
};
