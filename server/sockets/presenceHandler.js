const User = require('../models/User');

const onlineUsers = new Map(); // userId -> Set of socketIds

const handlePresence = (io, socket) => {
  const userId = socket.user._id.toString();

  // Track socket connection
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  // Update DB status to online
  User.findByIdAndUpdate(userId, { isOnline: true }).then(async () => {
    // Broadcast user online status
    socket.broadcast.emit('user_online', { userId, lastSeen: new Date() });

    // Auto-deliver undelivered messages sent to this user
    try {
      const Message = require('../models/Message');
      const Conversation = require('../models/Conversation');
      const userConvs = await Conversation.find({ participants: userId }).select('_id');
      const convIds = userConvs.map((c) => c._id);

      const undeliveredMsgs = await Message.find({
        conversationId: { $in: convIds },
        sender: { $ne: userId },
        deliveredTo: { $ne: userId },
      });

      if (undeliveredMsgs.length > 0) {
        await Message.updateMany(
          { _id: { $in: undeliveredMsgs.map((m) => m._id) } },
          { $addToSet: { deliveredTo: userId } }
        );

        undeliveredMsgs.forEach((msg) => {
          io.to(`conv_${msg.conversationId.toString()}`).emit('message_delivered', {
            messageId: msg._id,
            conversationId: msg.conversationId,
            deliveredToUserId: userId,
          });
        });
      }
    } catch (err) {
      console.error('Auto delivery on socket connect error:', err);
    }
  });

  // Handle Disconnect
  socket.on('disconnect', async () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
        socket.broadcast.emit('user_offline', { userId, lastSeen });
      }
    }
  });
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { handlePresence, getOnlineUsers };
