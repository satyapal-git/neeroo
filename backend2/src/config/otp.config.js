module.exports = {
  // SMS Provider Selection
  provider: process.env.SMS_PROVIDER || 'CONSOLE', // CONSOLE, MSG91, TWILIO

  // MSG91 Configuration
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY,
    senderId: process.env.MSG91_SENDER_ID || 'TAJFOD',
    templateId: process.env.MSG91_TEMPLATE_ID,
    route: '4', // Transactional route
    country: '91', // India
  },

  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // OTP Settings
  otpLength: parseInt(process.env.OTP_LENGTH) || 6,
  otpExpiry: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5, // minutes

  // Message Templates
  templates: {
    userOTP: (otp) => `Your OTP for Taj Food Bakers & Caterers login is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
    adminOTP: (otp) => `Your Admin OTP for Taj Food Bakers & Caterers is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
  },
};