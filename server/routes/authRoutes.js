const express = require('express');
const router = express.Router();
const { register, login, sendOtp, verifyOtp, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
