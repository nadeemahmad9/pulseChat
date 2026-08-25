const handleTyping = (io, socket) => {
  // User starts typing in a conversation
  socket.on('typing_start', ({ conversationId }) => {
    socket.to(`conv_${conversationId}`).emit('typing_start', {
      conversationId,
      userId: socket.user._id,
      user: {
        _id: socket.user._id,
        name: socket.user.name,
        username: socket.user.username,
      },
    });
  });

  // User stops typing
  socket.on('typing_stop', ({ conversationId }) => {
    socket.to(`conv_${conversationId}`).emit('typing_stop', {
      conversationId,
      userId: socket.user._id,
    });
  });
};

module.exports = { handleTyping };
