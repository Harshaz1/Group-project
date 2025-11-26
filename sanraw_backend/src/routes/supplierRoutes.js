const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.get('/', supplierController.getAllSuppliers);
router.get('/:id', supplierController.getSupplierById);

// Creation and modification restricted to owners
router.post('/', verifyRole(['owner']), supplierController.createSupplier);
router.put('/:id', verifyRole(['owner']), supplierController.updateSupplier);
router.delete('/:id', verifyRole(['owner']), supplierController.deleteSupplier);

module.exports = router;
