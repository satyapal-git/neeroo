const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'],
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
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
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for orders
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId',
});

// Index for faster queries
userSchema.index({ createdAt: -1 });
userSchema.index({ 'fcmTokens.token': 1 }); // Index for FCM token lookup

// Method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Method to add FCM token
userSchema.methods.addFcmToken = function (token, deviceType = 'web') {
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
userSchema.methods.removeFcmToken = function (token) {
  this.fcmTokens = this.fcmTokens.filter((t) => t.token !== token);
  return this.save();
};

// Method to get all FCM tokens as array
userSchema.methods.getFcmTokens = function () {
  return this.fcmTokens.map((t) => t.token);
};

// Method to clean old FCM tokens (older than 90 days)
userSchema.methods.cleanOldTokens = function () {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  this.fcmTokens = this.fcmTokens.filter(
    (t) => t.createdAt > ninetyDaysAgo
  );
  
  return this.save();
};

// Static method to find by mobile
userSchema.statics.findByMobile = function (mobile) {
  return this.findOne({ mobile, isActive: true });
};

// Static method to find users by FCM token
userSchema.statics.findByFcmToken = function (token) {
  return this.findOne({ 'fcmTokens.token': token });
};

// Pre-save hook to limit number of FCM tokens per user (max 5 devices)
userSchema.pre('save', function (next) {
  if (this.fcmTokens && this.fcmTokens.length > 5) {
    // Keep only the 5 most recent tokens
    this.fcmTokens = this.fcmTokens
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;