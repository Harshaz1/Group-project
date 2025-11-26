const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/purchase', inventoryController.addPurchase);
router.get('/', inventoryController.getAllPurchases);

module.exports = router;
