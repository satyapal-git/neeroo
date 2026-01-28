const appConfig = require('../config/app.config');

/**
 * Generate Random OTP
 */
const generateOTP = (length = appConfig.otp.length) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Calculate GST Amount
 */
const calculateGST = (subtotal) => {
  return Math.round(subtotal * appConfig.gst.percentage);
};

/**
 * Calculate Total with GST
 */
const calculateTotal = (subtotal) => {
  const gst = calculateGST(subtotal);
  return subtotal + gst;
};

/**
 * Format Mobile Number
 */
const formatMobile = (mobile) => {
  return mobile.replace(/\D/g, '').slice(0, 10);
};

/**
 * Generate Order ID
 */
const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${appConfig.order.idPrefix}${timestamp}${random}`;
};

/**
 * Get Pagination Options
 */
const getPaginationOptions = (page, limit) => {
  const currentPage = parseInt(page) || appConfig.pagination.defaultPage;
  const pageLimit = Math.min(
    parseInt(limit) || appConfig.pagination.defaultLimit,
    appConfig.pagination.maxLimit
  );
  const skip = (currentPage - 1) * pageLimit;

  return {
    page: currentPage,
    limit: pageLimit,
    skip,
  };
};

/**
 * Format Date to IST
 */
const formatDateIST = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Get Start and End of Day
 */
const getStartEndOfDay = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

/**
 * Sleep/Delay Function
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Remove undefined/null from object
 */
const cleanObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Capitalize First Letter
 */
const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate Random String
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  generateOTP,
  calculateGST,
  calculateTotal,
  formatMobile,
  generateOrderId,
  getPaginationOptions,
  formatDateIST,
  getStartEndOfDay,
  sleep,
  cleanObject,
  capitalizeFirst,
  generateRandomString,
};