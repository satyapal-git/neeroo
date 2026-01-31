import { messaging, getToken, onMessage } from '../firebase';
import api from './api';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

class FCMService {
  constructor() {
    this.currentToken = null;
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else if (permission === 'denied') {
        console.log('Notification permission denied');
        return false;
      } else {
        console.log('Notification permission dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getToken() {
    try {
      if (!messaging) {
        console.error('Firebase messaging not initialized');
        return null;
      }

      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (currentToken) {
        console.log('FCM Token obtained:', currentToken.substring(0, 20) + '...');
        this.currentToken = currentToken;
        return currentToken;
      } else {
        console.log('No FCM token available. Request permission to generate one.');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      
      if (error.code === 'messaging/permission-blocked') {
        console.error('Notification permission is blocked. Please enable it in browser settings.');
      }
      
      return null;
    }
  }

  async registerToken(deviceType = 'web') {
    try {
      // Check if permission is already granted
      if (Notification.permission !== 'granted') {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
          console.log('Cannot register FCM token without permission');
          return null;
        }
      }

      const token = await this.getToken();
      
      if (token) {
        // Send token to backend
        const response = await api.post('/fcm/register', {
          fcmToken: token,
          deviceType,
        });

        if (response.data.success) {
          // Store in localStorage
          localStorage.setItem('fcmToken', token);
          console.log('FCM token registered successfully');
          return token;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error registering FCM token:', error);
      return null;
    }
  }

  async unregisterToken() {
    try {
      const token = localStorage.getItem('fcmToken') || this.currentToken;
      
      if (token) {
        await api.delete('/fcm/unregister', {
          data: { fcmToken: token },
        });
        
        localStorage.removeItem('fcmToken');
        this.currentToken = null;
        console.log('FCM token unregistered successfully');
      }
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
    }
  }

  setupForegroundListener(callback) {
    if (!messaging) {
      console.error('Firebase messaging not initialized');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Foreground notification received:', payload);
      
      if (callback) {
        callback(payload);
      }

      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        const notificationTitle = payload.notification?.title || 'New Notification';
        const notificationOptions = {
          body: payload.notification?.body || 'You have a new notification',
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: payload.data?.notificationId || 'notification',
          data: payload.data,
          requireInteraction: false,
        };

        new Notification(notificationTitle, notificationOptions);
      }
    });
  }

  getCurrentToken() {
    return this.currentToken || localStorage.getItem('fcmToken');
  }

  hasPermission() {
    return Notification.permission === 'granted';
  }
}

export default new FCMService();