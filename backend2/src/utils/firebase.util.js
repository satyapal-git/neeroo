const admin = require('firebase-admin');
const logger = require('./logger.util');
const path = require('path');

let firebaseInitialized = false;

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (firebaseInitialized) {
    return;
  }

  try {
    // Check if service account file exists
    const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error(`Firebase initialization error: ${error.message}`);
    logger.warn('Push notifications will not work without Firebase configuration');
  }
};

// Initialize on module load
initializeFirebase();

/**
 * Send Push Notification to Single Device
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!firebaseInitialized) {
    logger.warn('Firebase not initialized, skipping push notification');
    return null;
  }

  try {
    if (!fcmToken) {
      logger.warn('FCM token not provided');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        timestamp: Date.now().toString(),
      },
      token: fcmToken,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [200, 100, 200],
        },
      },
    };

    const response = await admin.messaging().send(message);
    logger.info(`Push notification sent successfully: ${response}`);
    return response;

  } catch (error) {
    logger.error(`Error sending push notification: ${error.message}`);
    
    // Handle invalid tokens
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      logger.warn(`Invalid FCM token: ${fcmToken}`);
      return { error: 'invalid_token', token: fcmToken };
    }
    
    return null;
  }
};

/**
 * Send Push Notification to Multiple Devices
 */
const sendMulticastNotification = async (fcmTokens, title, body, data = {}) => {
  if (!firebaseInitialized) {
    logger.warn('Firebase not initialized, skipping multicast notification');
    return null;
  }

  try {
    if (!fcmTokens || fcmTokens.length === 0) {
      logger.warn('No FCM tokens provided');
      return null;
    }

    // Filter out invalid tokens
    const validTokens = fcmTokens.filter(token => token && token.length > 0);
    
    if (validTokens.length === 0) {
      logger.warn('No valid FCM tokens found');
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        timestamp: Date.now().toString(),
      },
      tokens: validTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    logger.info(`Multicast notification sent: ${response.successCount} success, ${response.failureCount} failed`);
    
    // Return invalid tokens for cleanup
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        invalidTokens.push(validTokens[idx]);
      }
    });
    
    return { 
      success: response.successCount,
      failed: response.failureCount,
      invalidTokens 
    };

  } catch (error) {
    logger.error(`Error sending multicast notification: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification,
  isFirebaseInitialized: () => firebaseInitialized,
};