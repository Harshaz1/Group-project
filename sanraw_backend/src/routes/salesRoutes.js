const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', salesController.createSale);
router.get('/', salesController.getAllSales);
router.get('/:id', salesController.getSaleById);

module.exports = router;
