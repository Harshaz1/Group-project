const reportsService = require('../services/reportsService');

const getDailySales = async (req, res) => {
    try {
        const data = await reportsService.getDailySales();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await reportsService.getSalesReport(startDate, endDate);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getInventoryReport = async (req, res) => {
    try {
        const data = await reportsService.getInventoryReport();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCreditReport = async (req, res) => {
    try {
        const data = await reportsService.getCreditReport();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCreditPaymentReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await reportsService.getCreditPaymentReport(startDate, endDate);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPurchasesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await reportsService.getPurchasesReport(startDate, endDate);
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDailySalesTrend = async (req, res) => {
    try {
        const data = await reportsService.getDailySalesGrowthEx();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPaddyStock = async (req, res) => {
    try {
        const data = await reportsService.getPaddyStockReport();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getInventorySummary = async (req, res) => {
    try {
        const data = await reportsService.getInventorySummary();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getDailySales,
    getSalesReport,
    getInventoryReport,
    getCreditReport,
    getCreditPaymentReport,
    getPurchasesReport,
    getDailySalesTrend,
    getPaddyStock,
    getInventorySummary
};
