const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets');

const PORT = process.env.PORT || 3000;

// Connect Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Store io on app instance for optional route access
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🚀 PulseChat Backend Server running on port ${PORT} `);
  console.log(`  🌐 Client URL allowed: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`  📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
