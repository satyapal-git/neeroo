const socketIO = require('socket.io');
const { verifyToken } = require('./jwt.util');
const logger = require('./logger.util');

let io;
const userSockets = new Map(); // userId -> Set of socketIds
const adminSockets = new Map(); // adminId -> Set of socketIds

/**
 * Initialize Socket.io
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Authenticate socket connection
    socket.on('authenticate', async (token) => {
      try {
        const decoded = verifyToken(token);
        
        if (decoded.role === 'admin') {
          // Store admin socket
          if (!adminSockets.has(decoded.id.toString())) {
            adminSockets.set(decoded.id.toString(), new Set());
          }
          adminSockets.get(decoded.id.toString()).add(socket.id);
          
          socket.userId = null;
          socket.adminId = decoded.id.toString();
          socket.join(`admin_${decoded.id}`);
          logger.info(`Admin authenticated: ${decoded.id}`);
        } else {
          // Store user socket
          if (!userSockets.has(decoded.id.toString())) {
            userSockets.set(decoded.id.toString(), new Set());
          }
          userSockets.get(decoded.id.toString()).add(socket.id);
          
          socket.userId = decoded.id.toString();
          socket.adminId = null;
          socket.join(`user_${decoded.id}`);
          logger.info(`User authenticated: ${decoded.id}`);
        }

        socket.emit('authenticated', { success: true });
      } catch (error) {
        logger.error(`Socket authentication error: ${error.message}`);
        socket.emit('authenticated', { success: false, error: 'Invalid token' });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        const sockets = userSockets.get(socket.userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(socket.userId);
          }
        }
        logger.info(`User disconnected: ${socket.userId}`);
      }
      if (socket.adminId) {
        const sockets = adminSockets.get(socket.adminId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            adminSockets.delete(socket.adminId);
          }
        }
        logger.info(`Admin disconnected: ${socket.adminId}`);
      }
    });
  });

  logger.info('Socket.io initialized successfully');
  return io;
};

/**
 * Send notification to specific user
 */
const sendToUser = (userId, event, data) => {
  if (!io) {
    logger.warn('Socket.io not initialized');
    return;
  }
  
  io.to(`user_${userId}`).emit(event, data);
  logger.info(`Socket notification sent to user ${userId}: ${event}`);
};

/**
 * Send notification to specific admin
 */
const sendToAdmin = (adminId, event, data) => {
  if (!io) {
    logger.warn('Socket.io not initialized');
    return;
  }
  
  io.to(`admin_${adminId}`).emit(event, data);
  logger.info(`Socket notification sent to admin ${adminId}: ${event}`);
};

/**
 * Send notification to all admins
 */
const sendToAllAdmins = (event, data) => {
  if (!io) {
    logger.warn('Socket.io not initialized');
    return;
  }
  
  adminSockets.forEach((sockets, adminId) => {
    io.to(`admin_${adminId}`).emit(event, data);
  });
  logger.info(`Socket notification sent to all admins: ${event}`);
};

/**
 * Get Socket.io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Check if user is online
 */
const isUserOnline = (userId) => {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
};

/**
 * Check if admin is online
 */
const isAdminOnline = (adminId) => {
  return adminSockets.has(adminId) && adminSockets.get(adminId).size > 0;
};

module.exports = {
  initializeSocket,
  sendToUser,
  sendToAdmin,
  sendToAllAdmins,
  getIO,
  isUserOnline,
  isAdminOnline,
};