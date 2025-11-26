const creditModel = require('../models/creditModel');

const createCreditAccount = async (nic) => {
    // Check if exists first to prevent duplicate error or let DB handle it
    const existing = await creditModel.getCreditByNIC(nic);
    if (existing) throw new Error('Account already exists');
    return await creditModel.createCreditAccount(nic);
};

const getCreditByNIC = async (nic) => {
    return await creditModel.getCreditByNIC(nic);
};

const payCredit = async (paymentData) => {
    return await creditModel.recordPayment(paymentData);
};

module.exports = {
    createCreditAccount,
    getCreditByNIC,
    payCredit
};
