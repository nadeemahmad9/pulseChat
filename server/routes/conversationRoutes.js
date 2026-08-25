const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreatePrivateConversation,
  createGroupConversation,
  togglePinConversation,
  toggleMuteConversation,
  toggleArchiveConversation,
  updateGroup,
  leaveGroup,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConversations);
router.post('/private', protect, getOrCreatePrivateConversation);
router.post('/group', protect, createGroupConversation);
router.patch('/:id/pin', protect, togglePinConversation);
router.patch('/:id/mute', protect, toggleMuteConversation);
router.patch('/:id/archive', protect, toggleArchiveConversation);
router.patch('/group/:id', protect, updateGroup);
router.post('/group/:id/leave', protect, leaveGroup);

module.exports = router;
