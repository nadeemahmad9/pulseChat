const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Get paginated messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;
    const userId = req.user._id;

    // Check if user is participant of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
      return res.status(403).json({ message: 'Not authorized to view messages in this conversation' });
    }

    const query = {
      conversationId,
      deletedFor: { $ne: userId },
    };

    const totalMessages = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username' },
      })
      .populate('reactions.user', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mark messages as read by current user
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId, deliveredTo: userId },
      }
    );

    res.status(200).json({
      messages: messages.reverse(), // Send in chronological order
      page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error loading messages' });
  }
};

// @desc    Send a message (Text or Media)
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type, attachments, replyTo } = req.body;
    const senderId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if blocked
    if (conversation.type === 'private') {
      const recipientId = conversation.participants.find((p) => p.toString() !== senderId.toString());
      if (recipientId) {
        const recipient = await User.findById(recipientId);
        if (recipient && recipient.blockedUsers.includes(senderId)) {
          return res.status(403).json({ message: 'You have been blocked by this user' });
        }
      }
    }

    const message = await Message.create({
      conversationId,
      sender: senderId,
      content: content || '',
      type: type || 'text',
      attachments: attachments || [],
      replyTo: replyTo || null,
      deliveredTo: [senderId],
      readBy: [senderId],
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name username avatar')
      .populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'name username' },
      });

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error sending message' });
  }
};

// @desc    Edit a message
// @route   PATCH /api/messages/:id
// @access  Private
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    if (message.isDeleted) {
      return res.status(400).json({ message: 'Deleted messages cannot be edited' });
    }

    message.content = content.trim();
    message.editedAt = new Date();
    await message.save();

    const updated = await Message.findById(id)
      .populate('sender', 'name username avatar')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name username' } });

    res.status(200).json({ message: updated });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error editing message' });
  }
};

// @desc    Delete message (for me OR for everyone)
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteForEveryone } = req.query;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (deleteForEveryone === 'true') {
      if (message.sender.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Only the sender can delete this message for everyone' });
      }

      message.isDeleted = true;
      message.content = 'This message was deleted';
      message.attachments = [];
      await message.save();
    } else {
      await Message.findByIdAndUpdate(id, {
        $addToSet: { deletedFor: userId },
      });
    }

    res.status(200).json({ message: 'Message deleted successfully', id, isDeletedForEveryone: deleteForEveryone === 'true' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting message' });
  }
};

// @desc    Add / Remove Reaction (Multi-reaction per user support)
// @route   POST /api/messages/:id/react
// @access  Private
const reactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check karein ki kya THIS exact user ne THIS exact emoji react kiya hai
    const existingIndex = message.reactions.findIndex(
      (r) => r.user.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      // 1. Agar wahi emoji dobara click kiya -> Remove (Toggle off)
      message.reactions.splice(existingIndex, 1);
    } else {
      // 2. Agar naya/alag emoji click kiya -> Add as additional reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    const updated = await Message.findById(id)
      .populate('sender', 'name username avatar')
      .populate('reactions.user', 'name username avatar');

    res.status(200).json({ message: updated });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error reacting to message' });
  }
};

// @desc    Forward Message to target conversations
// @route   POST /api/messages/forward
// @access  Private
const forwardMessage = async (req, res) => {
  try {
    const { messageId, targetConversationIds } = req.body;
    const senderId = req.user._id;

    if (!messageId || !targetConversationIds || !Array.isArray(targetConversationIds)) {
      return res.status(400).json({ message: 'Invalid payload for forwarding message' });
    }

    const originalMsg = await Message.findById(messageId);
    if (!originalMsg) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    const forwardedMessages = [];

    for (const convId of targetConversationIds) {
      const newMsg = await Message.create({
        conversationId: convId,
        sender: senderId,
        content: originalMsg.content,
        type: originalMsg.type,
        attachments: originalMsg.attachments,
        deliveredTo: [senderId],
        readBy: [senderId],
      });

      await Conversation.findByIdAndUpdate(convId, {
        lastMessage: newMsg._id,
        lastMessageAt: newMsg.createdAt,
      });

      const populated = await Message.findById(newMsg._id).populate('sender', 'name username avatar');
      forwardedMessages.push(populated);
    }

    res.status(200).json({ message: 'Message forwarded successfully', forwardedMessages });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error forwarding message' });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  reactMessage,
  forwardMessage,
};
