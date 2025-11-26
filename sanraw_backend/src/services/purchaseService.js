const purchaseModel = require('../models/purchaseModel');

const createPurchase = async (purchaseData, items, userId) => {
    return await purchaseModel.createPurchase(purchaseData, items, userId);
};

const getPurchaseBills = async (paymentType) => {
    return await purchaseModel.getPurchaseBills(paymentType);
};

const getPurchaseBillById = async (id) => {
    return await purchaseModel.getPurchaseBillById(id);
};

module.exports = {
    createPurchase,
    getPurchaseBills,
    getPurchaseBillById
};
