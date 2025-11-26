const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// router.post('/signup', authController.signup); // Disabled public signup
router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);
// router.get('/activate/:token', authController.activateAccount);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
