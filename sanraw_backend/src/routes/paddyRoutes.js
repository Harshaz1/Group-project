const express = require('express');
const router = express.Router();
const paddyController = require('../controllers/paddyController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/', verifyRole(['owner']), paddyController.createPaddy);
router.get('/', paddyController.getAllPaddy);
router.get('/:id', paddyController.getPaddyById);
router.put('/:id', verifyRole(['owner']), paddyController.updatePaddy);
router.delete('/:id', verifyRole(['owner']), paddyController.deletePaddy);

module.exports = router;
