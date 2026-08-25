const express = require('express');
const router = express.Router();
const { updateProfile, updatePrivacySettings, searchUsers, blockUser, unblockUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.patch('/profile', protect, updateProfile);
router.patch('/privacy', protect, updatePrivacySettings);
router.get('/search', protect, searchUsers);
router.post('/block/:userId', protect, blockUser);
router.post('/unblock/:userId', protect, unblockUser);

module.exports = router;
