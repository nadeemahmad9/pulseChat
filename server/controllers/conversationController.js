const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for logged-in user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name username avatar bio isOnline lastSeen privacySettings')
      .populate('admins', 'name username avatar')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name username avatar',
        },
      })
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    // Auto-deliver undelivered messages sent to this user
    const conversationIds = conversations.map((c) => c._id);
    await Message.updateMany(
      {
        conversationId: { $in: conversationIds },
        sender: { $ne: userId },
        deliveredTo: { $ne: userId },
      },
      {
        $addToSet: { deliveredTo: userId },
      }
    );

    // Calculate unread count per conversation for this user
    const conversationList = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          readBy: { $ne: userId },
          deletedFor: { $ne: userId },
        });

        const convObj = conv.toObject();
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    res.status(200).json({ conversations: conversationList });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching conversations' });
  }
};

// @desc    Get or Create 1-on-1 private conversation
// @route   POST /api/conversations/private
// @access  Private
const getOrCreatePrivateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient user ID is required' });
    }

    if (recipientId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot start a conversation with yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Find existing private conversation
    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    })
      .populate('participants', 'name username avatar bio isOnline lastSeen privacySettings')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'private',
        participants: [currentUserId, recipientId],
        createdBy: currentUserId,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name username avatar bio isOnline lastSeen privacySettings');
    }

    const convObj = conversation.toObject();
    convObj.unreadCount = await Message.countDocuments({
      conversationId: conversation._id,
      sender: { $ne: currentUserId },
      readBy: { $ne: currentUserId },
      deletedFor: { $ne: currentUserId },
    });

    res.status(200).json({ conversation: convObj });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error initializing chat' });
  }
};

// @desc    Create a Group Chat
// @route   POST /api/conversations/group
// @access  Private
const createGroupConversation = async (req, res) => {
  try {
    const { name, participants, description, avatar } = req.body;
    const currentUserId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!participants || !Array.isArray(participants) || participants.length < 1) {
      return res.status(400).json({ message: 'Please select at least 1 other participant for group creation' });
    }

    const memberIds = Array.from(new Set([...participants, currentUserId.toString()]));

    const group = await Conversation.create({
      type: 'group',
      name: name.trim(),
      description: description ? description.trim() : '',
      avatar: avatar || '',
      participants: memberIds,
      admins: [currentUserId],
      createdBy: currentUserId,
    });

    // Create a system message announcing group creation
    const systemMsg = await Message.create({
      conversationId: group._id,
      sender: currentUserId,
      content: `${req.user.name} created group "${group.name}"`,
      type: 'system',
    });

    group.lastMessage = systemMsg._id;
    group.lastMessageAt = systemMsg.createdAt;
    await group.save();

    const populatedGroup = await Conversation.findById(group._id)
      .populate('participants', 'name username avatar bio isOnline lastSeen privacySettings')
      .populate('admins', 'name username avatar')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatar' },
      });

    res.status(201).json({ group: populatedGroup });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating group' });
  }
};

// @desc    Toggle Pin conversation
// @route   PATCH /api/conversations/:id/pin
// @access  Private
const togglePinConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isPinned = user.pinnedConversations.includes(id);

    if (isPinned) {
      await User.findByIdAndUpdate(userId, { $pull: { pinnedConversations: id } });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { pinnedConversations: id } });
    }

    res.status(200).json({ message: isPinned ? 'Unpinned' : 'Pinned', isPinned: !isPinned });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error pinning conversation' });
  }
};

// @desc    Toggle Mute conversation
// @route   PATCH /api/conversations/:id/mute
// @access  Private
const toggleMuteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isMuted = user.mutedConversations.includes(id);

    if (isMuted) {
      await User.findByIdAndUpdate(userId, { $pull: { mutedConversations: id } });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { mutedConversations: id } });
    }

    res.status(200).json({ message: isMuted ? 'Unmuted' : 'Muted', isMuted: !isMuted });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error muting conversation' });
  }
};

// @desc    Toggle Archive conversation
// @route   PATCH /api/conversations/:id/archive
// @access  Private
const toggleArchiveConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isArchived = user.archivedConversations.includes(id);

    if (isArchived) {
      await User.findByIdAndUpdate(userId, { $pull: { archivedConversations: id } });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { archivedConversations: id } });
    }

    res.status(200).json({ message: isArchived ? 'Unarchived' : 'Archived', isArchived: !isArchived });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error archiving conversation' });
  }
};

// @desc    Update Group Info / Add / Remove / Promote Members
// @route   PATCH /api/conversations/group/:id
// @access  Private
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, avatar, addMembers, removeMembers, promoteAdmins, demoteAdmins } = req.body;
    const userId = req.user._id;

    const group = await Conversation.findById(id);
    if (!group || group.type !== 'group') {
      return res.status(404).json({ message: 'Group conversation not found' });
    }

    const isAdmin = group.admins.some((adminId) => adminId.toString() === userId.toString());

    if (name || description !== undefined || avatar !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only group admins can update group details' });
      }
      if (name) group.name = name.trim();
      if (description !== undefined) group.description = description.trim();
      if (avatar !== undefined) group.avatar = avatar;
    }

    if (addMembers && Array.isArray(addMembers) && addMembers.length > 0) {
      if (!isAdmin) return res.status(403).json({ message: 'Only admins can add members' });
      addMembers.forEach((mId) => {
        if (!group.participants.includes(mId)) group.participants.push(mId);
      });
    }

    if (removeMembers && Array.isArray(removeMembers) && removeMembers.length > 0) {
      if (!isAdmin) return res.status(403).json({ message: 'Only admins can remove members' });
      group.participants = group.participants.filter((p) => !removeMembers.includes(p.toString()));
      group.admins = group.admins.filter((a) => !removeMembers.includes(a.toString()));
    }

    if (promoteAdmins && Array.isArray(promoteAdmins) && promoteAdmins.length > 0) {
      if (!isAdmin) return res.status(403).json({ message: 'Only admins can promote members' });
      promoteAdmins.forEach((pId) => {
        if (group.participants.includes(pId) && !group.admins.includes(pId)) {
          group.admins.push(pId);
        }
      });
    }

    if (demoteAdmins && Array.isArray(demoteAdmins) && demoteAdmins.length > 0) {
      if (!isAdmin) return res.status(403).json({ message: 'Only admins can demote admins' });
      group.admins = group.admins.filter((a) => !demoteAdmins.includes(a.toString()));
    }

    await group.save();

    const updatedGroup = await Conversation.findById(id)
      .populate('participants', 'name username avatar bio isOnline lastSeen privacySettings')
      .populate('admins', 'name username avatar');

    res.status(200).json({ group: updatedGroup });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating group' });
  }
};

// @desc    Leave Group
// @route   POST /api/conversations/group/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Conversation.findById(id);
    if (!group || group.type !== 'group') {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.participants = group.participants.filter((p) => p.toString() !== userId.toString());
    group.admins = group.admins.filter((a) => a.toString() !== userId.toString());

    // If no participants left, delete group
    if (group.participants.length === 0) {
      await Conversation.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Left group and group dissolved' });
    }

    // If no admin remains, promote the first participant
    if (group.admins.length === 0 && group.participants.length > 0) {
      group.admins.push(group.participants[0]);
    }

    // System message
    const sysMsg = await Message.create({
      conversationId: id,
      sender: userId,
      content: `${req.user.name} left the group`,
      type: 'system',
    });

    group.lastMessage = sysMsg._id;
    group.lastMessageAt = sysMsg.createdAt;
    await group.save();

    res.status(200).json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error leaving group' });
  }
};

module.exports = {
  getConversations,
  getOrCreatePrivateConversation,
  createGroupConversation,
  togglePinConversation,
  toggleMuteConversation,
  toggleArchiveConversation,
  updateGroup,
  leaveGroup,
};
