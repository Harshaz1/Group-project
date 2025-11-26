const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/create', creditController.createAccount);
router.get('/:nic', creditController.getCreditInfo);
router.post('/pay', creditController.payCredit);

module.exports = router;
