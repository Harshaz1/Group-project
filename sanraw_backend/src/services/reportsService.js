const reportsModel = require('../models/reportsModel');

const getDailySales = async () => {
    return await reportsModel.getDailySales();
};

const getSalesReport = async (startDate, endDate) => {
    return await reportsModel.getSalesReport(startDate, endDate);
};

const getInventoryReport = async () => {
    return await reportsModel.getInventoryReport();
};

const getCreditReport = async () => {
    return await reportsModel.getCreditReport();
};

const getCreditPaymentReport = async (startDate, endDate) => {
    return await reportsModel.getCreditPaymentReport(startDate, endDate);
};

const getPurchasesReport = async (startDate, endDate) => {
    return await reportsModel.getPurchasesReport(startDate, endDate);
};

const getDailySalesGrowthEx = async () => {
    return await reportsModel.getDailySalesGrowthEx();
};

const getPaddyStockReport = async () => {
    return await reportsModel.getPaddyStockReport();
};

const getInventorySummary = async () => {
    return await reportsModel.getInventorySummary();
};

module.exports = {
    getDailySales,
    getSalesReport,
    getInventoryReport,
    getCreditReport,
    getCreditPaymentReport,
    getPurchasesReport,
    getDailySalesGrowthEx,
    getPaddyStockReport,
    getInventorySummary
};
