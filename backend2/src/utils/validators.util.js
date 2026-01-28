/**
 * Validate Mobile Number (Indian)
 */
const isValidMobile = (mobile) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

/**
 * Validate Email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate OTP
 */
const isValidOTP = (otp) => {
  return otp && otp.length === 6 && /^\d{6}$/.test(otp);
};

/**
 * Validate Name
 */
const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

/**
 * Validate Restaurant ID
 */
const isValidRestaurantId = (id) => {
  return id && id.trim().length >= 3 && /^[A-Z0-9]+$/.test(id.toUpperCase());
};

/**
 * Validate Price
 */
const isValidPrice = (price) => {
  return price && !isNaN(price) && parseFloat(price) >= 0;
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitize String (remove special characters)
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate Table Number
 */
const isValidTableNumber = (tableNumber) => {
  return tableNumber && tableNumber.trim().length > 0;
};

/**
 * Validate Order Status
 */
const isValidOrderStatus = (status) => {
  const validStatuses = ['pending', 'preparing', 'ready', 'delivered'];
  return validStatuses.includes(status);
};

/**
 * Validate Category
 */
const isValidCategory = (category) => {
  const validCategories = [
    'indian', 'raita', 'salad', 'rice', 'toast',
    'tawe', 'tandoor', 'drinksSnacks', 'snacks',
    'pasta', 'chinese', 'beverage'
  ];
  return validCategories.includes(category);
};

/**
 * Validate Order Type
 */
const isValidOrderType = (orderType) => {
  return ['dine-in', 'takeaway'].includes(orderType);
};

module.exports = {
  isValidMobile,
  isValidEmail,
  isValidOTP,
  isValidName,
  isValidRestaurantId,
  isValidPrice,
  isValidObjectId,
  sanitizeString,
  isValidTableNumber,
  isValidOrderStatus,
  isValidCategory,
  isValidOrderType,
};