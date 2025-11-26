const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/daily-sales', reportsController.getDailySales);
router.get('/monthly-sales', reportsController.getSalesReport);
router.get('/inventory-report', reportsController.getInventoryReport);
router.get('/credit-report', reportsController.getCreditReport);
router.get('/credit-payment-report', reportsController.getCreditPaymentReport);
router.get('/inventory-purchase-report', reportsController.getPurchasesReport);

router.get('/daily-trend', reportsController.getDailySalesTrend);
router.get('/paddy-stock', reportsController.getPaddyStock);
router.get('/inventory-summary', reportsController.getInventorySummary);

module.exports = router;
