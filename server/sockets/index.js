const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('../models/User');
const { handlePresence } = require('./presenceHandler');
const { handleTyping } = require('./typingHandler');
const { handleChat } = require('./chatHandler');

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      let token;

      // 1. Try parsing cookies from handshake headers
      if (socket.handshake.headers.cookie) {
        const parsedCookies = cookie.parse(socket.handshake.headers.cookie);
        token = parsedCookies.jwt;
      }

      // 2. Fallback to auth token in handshake auth object
      if (!token && socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pulsechat_super_secret_jwt_key_production_ready_2026!');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket auth failed:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection Manager
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Join user's personal room for direct notifications
    socket.join(`user_${userId}`);

    // Register modular handlers
    handlePresence(io, socket);
    handleTyping(io, socket);
    handleChat(io, socket);
  });

  return io;
};

module.exports = initSocket;
