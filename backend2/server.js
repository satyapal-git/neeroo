console.log("🔥 SERVER.JS EXECUTED1");

require('dotenv').config();
console.log("🔥 SERVER.JS EXECUTED2");
const app = require('./src/app');
console.log("🔥 SERVER.JS EXECUTED3");
const connectDB = require('./src/config/db.config');
const logger = require('./src/utils/logger.util');

const PORT = process.env.PORT || 5000;

// Connect to Database
console.log("connectdb calling.....")
connectDB();

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`📱 API URL: http://localhost:${PORT}/api/${process.env.API_VERSION}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`❌ Uncaught Exception: ${err.message}`);
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