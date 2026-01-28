module.exports = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },

  // OTP
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5,
    length: parseInt(process.env.OTP_LENGTH) || 6,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Pagination
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },

  // GST
  gst: {
    percentage: 0.05, // 5%
  },

  // Order
  order: {
    idPrefix: 'SP',
    statuses: ['pending', 'preparing', 'ready', 'delivered'],
  },

  // Categories
  categories: [
    'indian', 'raita', 'salad', 'rice', 'toast',
    'tawe', 'tandoor', 'drinksSnacks', 'snacks',
    'pasta', 'chinese', 'beverage'
  ],
};