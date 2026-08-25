const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  reactMessage,
  forwardMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:conversationId', protect, getMessages);
router.post('/', protect, sendMessage);
router.patch('/:id', protect, editMessage);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/react', protect, reactMessage);
router.post('/forward', protect, forwardMessage);

module.exports = router;
