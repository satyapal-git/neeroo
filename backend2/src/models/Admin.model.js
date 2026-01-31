const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      index: true,
    },
    restaurantId: {
      type: String,
      required: [true, 'Restaurant ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Restaurant ID must be at least 3 characters'],
      index: true,
    },
    fcmTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        deviceType: {
          type: String,
          enum: ['android', 'ios', 'web'],
          default: 'web',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        _id: false, // Don't create _id for subdocuments
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
adminSchema.index({ createdAt: -1 });
adminSchema.index({ 'fcmTokens.token': 1 }); // Index for FCM token lookup

// Method to update last login
adminSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Method to add FCM token
adminSchema.methods.addFcmToken = function (token, deviceType = 'web') {
  // Check if token already exists
  const tokenExists = this.fcmTokens.some((t) => t.token === token);
  
  if (!tokenExists) {
    this.fcmTokens.push({
      token,
      deviceType,
      createdAt: new Date(),
    });
  }
  
  return this.save();
};

// Method to remove FCM token
adminSchema.methods.removeFcmToken = function (token) {
  this.fcmTokens = this.fcmTokens.filter((t) => t.token !== token);
  return this.save();
};

// Method to get all FCM tokens as array
adminSchema.methods.getFcmTokens = function () {
  return this.fcmTokens.map((t) => t.token);
};

// Method to clean old FCM tokens (older than 90 days)
adminSchema.methods.cleanOldTokens = function () {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  this.fcmTokens = this.fcmTokens.filter(
    (t) => t.createdAt > ninetyDaysAgo
  );
  
  return this.save();
};

// Static method to find by mobile
adminSchema.statics.findByMobile = function (mobile) {
  return this.findOne({ mobile });
};

// Static method to find by email
adminSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by restaurant ID
adminSchema.statics.findByRestaurantId = function (restaurantId) {
  return this.findOne({ restaurantId: restaurantId.toUpperCase() });
};

// Static method to check if admin exists
adminSchema.statics.adminExists = function () {
  return this.exists({});
};

// Static method to find admin by FCM token
adminSchema.statics.findByFcmToken = function (token) {
  return this.findOne({ 'fcmTokens.token': token });
};

// Static method to get all active admins with FCM tokens
adminSchema.statics.getAdminsWithFcmTokens = function () {
  return this.find({
    isActive: true,
    fcmTokens: { $exists: true, $not: { $size: 0 } },
  }).select('_id fcmTokens');
};

// Pre-save hook to limit number of FCM tokens per admin (max 5 devices)
adminSchema.pre('save', function (next) {
  if (this.fcmTokens && this.fcmTokens.length > 5) {
    // Keep only the 5 most recent tokens
    this.fcmTokens = this.fcmTokens
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;