const OTP = require('../models/OTP.model');
const smsService = require('./sms.service');
const { generateOTP } = require('../utils/helpers.util');
const otpConfig = require('../config/otp.config');
const appConfig = require('../config/app.config');
const logger = require('../utils/logger.util');
const MESSAGES = require('../constants/messages.constant');

/**
 * Generate and Send OTP
 */
const sendOTP = async (mobile, type = 'user') => {
  try {

    if (!mobile) {
      throw new Error('Mobile number is required for OTP');
    }
    // Invalidate any old OTPs for this mobile
    await OTP.invalidateOldOTPs(mobile, type);

    // Generate new OTP
    const otpCode = generateOTP(otpConfig.otpLength);

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + appConfig.otp.expiryMinutes);

    // Save OTP to database
    const otpRecord = await OTP.create({
      mobile,
      otp: otpCode,
      type,
      expiresAt,
    });

    // Send SMS
    const message = type === 'admin' 
      ? otpConfig.templates.adminOTP(otpCode)
      : otpConfig.templates.userOTP(otpCode);

    await smsService.sendSMS(mobile, message);
    console.log("OTP is : ", otpRecord);
    logger.info(`OTP sent to ${mobile} (Type: ${type})`);

    return {
      success: true,
      message: MESSAGES.SUCCESS.OTP_SENT,
      expiresAt,
    };

  } catch (error) {
    logger.error(`Error sending OTP to ${mobile}: ${error.message}`);
    throw error;
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (mobile, otpCode, type = 'user') => {
  try {
    // Find valid OTP
    const otpRecord = await OTP.findValidOTP(mobile, type);

    if (!otpRecord) {
      return {
        success: false,
        message: MESSAGES.ERROR.INVALID_OTP,
      };
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      return {
        success: false,
        message: MESSAGES.ERROR.OTP_EXPIRED,
      };
    }

    // Check max attempts
    if (otpRecord.isMaxAttemptsReached()) {
      return {
        success: false,
        message: 'Maximum verification attempts reached. Please request a new OTP.',
      };
    }

    // Verify OTP
    if (String(otpRecord.otp) !== String(otpCode)) {
      await otpRecord.incrementAttempts();
      return {
        success: false,
        message: MESSAGES.ERROR.INVALID_OTP,
      };
    }


    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    logger.info(`OTP verified successfully for ${mobile} (Type: ${type})`);

    return {
      success: true,
      message: 'OTP verified successfully',
    };

  } catch (error) {
    logger.error(`Error verifying OTP for ${mobile}: ${error.message}`);
    throw error;
  }
};

/**
 * Check if OTP exists and is valid
 */
const isOTPValid = async (mobile, type = 'user') => {
  const otpRecord = await OTP.findValidOTP(mobile, type);
  return otpRecord && !otpRecord.isExpired();
};

/**
 * Delete expired OTPs (cleanup job)
 */
const cleanupExpiredOTPs = async () => {
  try {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    logger.info(`Cleaned up ${result.deletedCount} expired OTPs`);
    return result.deletedCount;
  } catch (error) {
    logger.error(`Error cleaning up expired OTPs: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  isOTPValid,
  cleanupExpiredOTPs,
};