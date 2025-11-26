const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/', verifyRole(['owner', 'employee']), billController.createBill);
router.get('/', billController.getAllBills);
router.get('/:id', billController.getBillById);
router.get('/payment/:type', billController.getBillsByPaymentType);
router.get('/user/:userId', billController.getBillsByUser);
router.patch('/:id/payment-status', verifyRole(['owner', 'employee']), billController.updatePaymentStatus);
router.put('/:id', verifyRole(['owner', 'employee']), billController.updateBill);
router.delete('/:id', verifyRole(['owner']), billController.deleteBill);

module.exports = router;
