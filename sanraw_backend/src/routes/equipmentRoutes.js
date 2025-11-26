const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

router.use(verifyToken);

router.post('/', verifyRole(['owner']), equipmentController.createEquipment);
router.get('/', equipmentController.getAllEquipment);
router.get('/:id', equipmentController.getEquipmentById);
router.put('/:id', verifyRole(['owner']), equipmentController.updateEquipment);
router.delete('/:id', verifyRole(['owner']), equipmentController.deleteEquipment);

module.exports = router;
