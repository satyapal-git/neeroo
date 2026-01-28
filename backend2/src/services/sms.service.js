const axios = require('axios');
const otpConfig = require('../config/otp.config');
const logger = require('../utils/logger.util');

/**
 * Send SMS via MSG91
 */
const sendViaMSG91 = async (mobile, message) => {
  try {
    const url = 'https://api.msg91.com/api/v5/flow/';
    
    const payload = {
      authkey: otpConfig.msg91.authKey,
      mobiles: `91${mobile}`,
      message,
      sender: otpConfig.msg91.senderId,
      route: otpConfig.msg91.route,
      country: otpConfig.msg91.country,
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info(`SMS sent via MSG91 to ${mobile}`);
    return response.data;

  } catch (error) {
    logger.error(`MSG91 SMS Error: ${error.message}`);
    throw error;
  }
};

/**
 * Send SMS via Twilio
 */
const sendViaTwilio = async (mobile, message) => {
  try {
    const accountSid = otpConfig.twilio.accountSid;
    const authToken = otpConfig.twilio.authToken;
    const fromNumber = otpConfig.twilio.phoneNumber;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const params = new URLSearchParams();
    params.append('To', `+91${mobile}`);
    params.append('From', fromNumber);
    params.append('Body', message);

    const response = await axios.post(url, params, {
      auth: {
        username: accountSid,
        password: authToken,
      },
    });

    logger.info(`SMS sent via Twilio to ${mobile}`);
    return response.data;

  } catch (error) {
    logger.error(`Twilio SMS Error: ${error.message}`);
    throw error;
  }
};

/**
 * Console SMS (for development)
 */
const sendViaConsole = async (mobile, message) => {
  logger.info('='.repeat(50));
  logger.info('📱 SMS (CONSOLE MODE)');
  logger.info(`To: ${mobile}`);
  logger.info(`Message: ${message}`);
  logger.info('='.repeat(50));
  return { success: true, mode: 'console' };
};

/**
 * Main Send SMS Function
 */
const sendSMS = async (mobile, message) => {
  try {
    const provider = otpConfig.provider.toUpperCase();

    switch (provider) {
      case 'MSG91':
        if (!otpConfig.msg91.authKey) {
          logger.warn('MSG91 not configured, falling back to CONSOLE mode');
          return await sendViaConsole(mobile, message);
        }
        return await sendViaMSG91(mobile, message);

      case 'TWILIO':
        if (!otpConfig.twilio.accountSid || !otpConfig.twilio.authToken) {
          logger.warn('Twilio not configured, falling back to CONSOLE mode');
          return await sendViaConsole(mobile, message);
        }
        return await sendViaTwilio(mobile, message);

      case 'CONSOLE':
      default:
        return await sendViaConsole(mobile, message);
    }

  } catch (error) {
    logger.error(`SMS Service Error: ${error.message}`);
    // Fallback to console in case of error
    if (otpConfig.provider !== 'CONSOLE') {
      logger.warn('SMS provider failed, falling back to CONSOLE mode');
      return await sendViaConsole(mobile, message);
    }
    throw error;
  }
};

/**
 * Send Bulk SMS
 */
const sendBulkSMS = async (mobiles, message) => {
  const results = [];
  for (const mobile of mobiles) {
    try {
      const result = await sendSMS(mobile, message);
      results.push({ mobile, success: true, result });
    } catch (error) {
      results.push({ mobile, success: false, error: error.message });
    }
  }
  return results;
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendViaMSG91,
  sendViaTwilio,
  sendViaConsole,
};