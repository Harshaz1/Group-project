const inventoryModel = require('../models/inventoryModel');

const addPurchase = async (data) => {
    return await inventoryModel.addPurchase(data);
};

const getAllPurchases = async () => {
    return await inventoryModel.getAllPurchases();
};

module.exports = {
    addPurchase,
    getAllPurchases
};
