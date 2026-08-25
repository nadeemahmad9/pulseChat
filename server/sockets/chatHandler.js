// const Message = require('../models/Message');
// const Conversation = require('../models/Conversation');

// const handleChat = (io, socket) => {
//   const userId = socket.user._id.toString();

//   // Join a conversation room
//   socket.on('join_conversation', ({ conversationId }) => {
//     socket.join(`conv_${conversationId}`);
//   });

//   // Leave a conversation room
//   socket.on('leave_conversation', ({ conversationId }) => {
//     socket.leave(`conv_${conversationId}`);
//   });

//   // Realtime send message event
//   socket.on('send_message', async (data) => {
//     try {
//       const { conversationId, tempId, message } = data;
//       // Broadcast to room
//       io.to(`conv_${conversationId}`).emit('receive_message', {
//         conversationId,
//         tempId,
//         message,
//       });

//       // Also notify all participant rooms so sidebars update lastMessage in real time
//       const conv = await Conversation.findById(conversationId);
//       if (conv) {
//         conv.participants.forEach((participantId) => {
//           io.to(`user_${participantId.toString()}`).emit('conversation_updated', {
//             conversationId,
//             lastMessage: message,
//             updatedAt: message.createdAt,
//           });
//         });
//       }
//     } catch (err) {
//       console.error('Socket send_message error:', err);
//     }
//   });

//   // Realtime message delivered receipt
//   socket.on('message_delivered', async ({ messageId, conversationId }) => {
//     try {
//       const msg = await Message.findByIdAndUpdate(
//         messageId,
//         { $addToSet: { deliveredTo: userId } },
//         { new: true }
//       );
//       io.to(`conv_${conversationId}`).emit('message_delivered', { messageId, conversationId, deliveredToUserId: userId, message: msg });
//     } catch (err) {
//       console.error('Socket message_delivered error:', err);
//     }
//   });

//   // Realtime message read receipt
//   socket.on('message_read', async ({ conversationId }) => {
//     try {
//       await Message.updateMany(
//         { conversationId, sender: { $ne: userId }, readBy: { $ne: userId } },
//         { $addToSet: { readBy: userId, deliveredTo: userId } }
//       );

//       io.to(`conv_${conversationId}`).emit('message_read', { conversationId, readByUserId: userId });
//       socket.to(`conv_${conversationId}`).emit('conversation_read', { conversationId, readByUserId: userId });
//     } catch (err) {
//       console.error('Socket message_read error:', err);
//     }
//   });

//   // Realtime reaction update
//   socket.on('message_reaction', ({ conversationId, message }) => {
//     io.to(`conv_${conversationId}`).emit('message_reaction', { conversationId, message });
//   });

//   // Realtime message edit
//   socket.on('message_edit', ({ conversationId, message }) => {
//     io.to(`conv_${conversationId}`).emit('message_edit', { conversationId, message });
//   });

//   // Realtime message delete
//   socket.on('message_delete', ({ conversationId, messageId, isDeletedForEveryone }) => {
//     io.to(`conv_${conversationId}`).emit('message_delete', { conversationId, messageId, isDeletedForEveryone });
//   });

//   // Realtime group details or participant change
//   socket.on('group_updated', ({ conversationId, group }) => {
//     io.to(`conv_${conversationId}`).emit('group_updated', { conversationId, group });
//   });
// };

// module.exports = { handleChat };


const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const handleChat = (io, socket) => {
  const userId = socket.user._id.toString();

  // 1. Join a conversation room
  socket.on('join_conversation', ({ conversationId }) => {
    if (conversationId) {
      socket.join(`conv_${conversationId}`);
    }
  });

  // 2. Leave a conversation room
  socket.on('leave_conversation', ({ conversationId }) => {
    if (conversationId) {
      socket.leave(`conv_${conversationId}`);
    }
  });

  // 3. Realtime send message event
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, tempId, message } = data;
      if (!conversationId || !message) return;

      // A. Chat room ke active users ko message deliver karein
      io.to(`conv_${conversationId}`).emit('receive_message', {
        conversationId,
        tempId,
        message,
      });

      // B. DB me Conversation ka lastMessage aur timestamp update karein
      const conv = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: message._id || message,
          lastMessageAt: message.createdAt || new Date(),
        },
        { new: true }
      );

      // C. Sabhi participants ke personal room me 'conversation_updated' emit karein (Sidebar sync)
      if (conv && Array.isArray(conv.participants)) {
        conv.participants.forEach((participant) => {
          // Safe ID extraction (ObjectId, Subdocument, ya Populated Object)
          const participantId = participant?._id
            ? participant._id.toString()
            : participant?.user
            ? participant.user.toString()
            : participant.toString();

          io.to(`user_${participantId}`).emit('conversation_updated', {
            conversationId,
            lastMessage: message,
            updatedAt: message.createdAt || new Date().toISOString(),
          });
        });
      }
    } catch (err) {
      console.error('Socket send_message error:', err);
    }
  });

  // 4. Realtime message delivered receipt
  socket.on('message_delivered', async ({ messageId, conversationId }) => {
    try {
      if (!messageId) return;

      const msg = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { deliveredTo: userId } },
        { new: true }
      );

      io.to(`conv_${conversationId}`).emit('message_delivered', {
        messageId,
        conversationId,
        deliveredToUserId: userId,
        message: msg,
      });
    } catch (err) {
      console.error('Socket message_delivered error:', err);
    }
  });

  // 5. Realtime message read receipt
  socket.on('message_read', async ({ conversationId }) => {
    try {
      if (!conversationId) return;

      await Message.updateMany(
        { conversationId, sender: { $ne: userId }, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId, deliveredTo: userId } }
      );

      // Chat screen update
      io.to(`conv_${conversationId}`).emit('message_read', {
        conversationId,
        readByUserId: userId,
      });

      socket.to(`conv_${conversationId}`).emit('conversation_read', {
        conversationId,
        readByUserId: userId,
      });
    } catch (err) {
      console.error('Socket message_read error:', err);
    }
  });

  // 6. Realtime reaction update
  socket.on('message_reaction', ({ conversationId, message }) => {
    io.to(`conv_${conversationId}`).emit('message_reaction', { conversationId, message });
  });

  // 7. Realtime message edit
  socket.on('message_edit', ({ conversationId, message }) => {
    io.to(`conv_${conversationId}`).emit('message_edit', { conversationId, message });
  });

  // 8. Realtime message delete
  socket.on('message_delete', ({ conversationId, messageId, isDeletedForEveryone }) => {
    io.to(`conv_${conversationId}`).emit('message_delete', {
      conversationId,
      messageId,
      isDeletedForEveryone,
    });
  });

  // 9. Realtime group details or participant change
  socket.on('group_updated', ({ conversationId, group }) => {
    io.to(`conv_${conversationId}`).emit('group_updated', { conversationId, group });
  });
};

module.exports = { handleChat };