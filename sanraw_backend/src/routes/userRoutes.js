const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

const upload = require('../middleware/uploadMiddleware');


router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, upload.single('profile_image'), userController.updateProfile);

// Login History
router.get('/history', verifyToken, userController.getLoginHistory);
router.delete('/history', verifyToken, userController.clearMyHistory);
router.delete('/history/:id', verifyToken, userController.deleteLoginHistoryItem);


// Owner only routes
router.use(verifyToken, verifyRole(['owner']));

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
