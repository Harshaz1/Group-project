const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/', verifyRole(['owner']), purchaseController.createPurchase);
router.get('/', purchaseController.getPurchaseBills);
router.get('/:id', purchaseController.getPurchaseBillById);

module.exports = router;
