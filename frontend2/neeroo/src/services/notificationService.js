import api from './api';

export const notificationService = {
  // Get all notifications for user
  getNotifications: async () => {
    return await api.get('/notifications');
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    return await api.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all as read
  markAllAsRead: async () => {
    return await api.patch('/notifications/read-all');
  },

  // Get unread count
  getUnreadCount: async () => {
    return await api.get('/notifications/unread-count');
  },

  // Admin: Send notification to user
  sendNotification: async (userId, message) => {
    return await api.post('/notifications/send', { userId, message });
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return await api.delete(`/notifications/${notificationId}`);
  },

  // Setup WebSocket or polling for real-time notifications
  // This can be extended with Socket.io or Firebase Cloud Messaging
  setupRealtimeUpdates: (callback) => {
    // Polling approach (can be replaced with WebSocket)
    const interval = setInterval(async () => {
      try {
        const data = await notificationService.getUnreadCount();
        callback(data.count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  },
};