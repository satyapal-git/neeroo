module.exports = {
  // WhatsApp Provider Selection
  whatsappProvider: process.env.WHATSAPP_PROVIDER || 'CONSOLE', // CONSOLE, TWILIO, MSG91

  // SMS Provider Selection (for fallback)
  smsProvider: process.env.SMS_PROVIDER || 'CONSOLE',

  // MSG91 Configuration
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY,
    senderId: process.env.MSG91_SENDER_ID || 'TAJFOD',
    templateId: process.env.MSG91_TEMPLATE_ID,
    whatsappTemplateId: process.env.MSG91_WHATSAPP_TEMPLATE_ID,
    route: '4',
    country: '91',
  },

  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
  },

  // OTP Settings
  otpLength: parseInt(process.env.OTP_LENGTH) || 6,
  otpExpiry: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5,

  // Message Templates
  templates: {
    userOTP: (otp) => `🔐 *Taj Food Bakers & Caterers*\n\nYour OTP is: *${otp}*\n\nValid for 5 minutes. Do not share with anyone.`,
    adminOTP: (otp) => `🔐 *Admin Login - Taj Food*\n\nYour OTP is: *${otp}*\n\nValid for 5 minutes. Keep it confidential.`,
  },
};