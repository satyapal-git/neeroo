console.log("🔥 SERVER.JS EXECUTED1");

require('dotenv').config();
console.log("🔥 SERVER.JS EXECUTED2");

const http = require('http');
const app = require('./src/app');
console.log("🔥 SERVER.JS EXECUTED3");

const connectDB = require('./src/config/db.config');
const logger = require('./src/utils/logger.util');
const { initializeSocket } = require('./src/utils/socket.util');

const PORT = process.env.PORT || 5000;

// Connect to Database
console.log("connectdb calling.....");
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
try {
  initializeSocket(server);
  logger.info('✅ Socket.io initialized successfully');
} catch (error) {
  logger.error(`❌ Socket.io initialization failed: ${error.message}`);
}

// Start Server
server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`📱 API URL: http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
  logger.info(`🔌 Socket.io URL: http://localhost:${PORT}`);
  logger.info(`🔔 Push Notifications: ${process.env.FIREBASE_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`❌ Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`❌ Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  // Exit process
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('✅ Process terminated');
  });
});