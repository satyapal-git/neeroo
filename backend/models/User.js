const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0
    }
  },
  profile: {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    }
  },
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  preferences: {
    favoriteItems: [{
      itemId: String,
      itemName: String,
      count: { type: Number, default: 1 }
    }],
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'jain', 'diabetic', 'low-salt']
    }],
    spiceLevel: {
      type: String,
      enum: ['mild', 'medium', 'hot', 'extra-hot'],
      default: 'medium'
    }
  },
  loyaltyPoints: {
    total: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'deleted'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ mobile: 1 });
userSchema.index({ 'otp.expiresAt': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for total orders
userSchema.virtual('totalOrders').get(function() {
  return this.orderHistory.length;
});

// Methods
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0
  };
  return otp;
};

userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return { success: false, message: 'No OTP found' };
  }
  
  if (this.otp.expiresAt < new Date()) {
    return { success: false, message: 'OTP has expired' };
  }
  
  if (this.otp.attempts >= 3) {
    return { success: false, message: 'Too many failed attempts. Please request new OTP' };
  }
  
  if (this.otp.code !== enteredOTP) {
    this.otp.attempts += 1;
    return { success: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid
  this.isVerified = true;
  this.otp = undefined; // Clear OTP after successful verification
  this.lastLogin = new Date();
  
  return { success: true, message: 'OTP verified successfully' };
};

userSchema.methods.addLoyaltyPoints = function(orderAmount) {
  const pointsEarned = Math.floor(orderAmount / 10); // 1 point per ₹10
  this.loyaltyPoints.total += pointsEarned;
  this.loyaltyPoints.available += pointsEarned;
  return pointsEarned;
};

userSchema.methods.useLoyaltyPoints = function(pointsToUse) {
  if (pointsToUse > this.loyaltyPoints.available) {
    return { success: false, message: 'Insufficient loyalty points' };
  }
  
  this.loyaltyPoints.used += pointsToUse;
  this.loyaltyPoints.available -= pointsToUse;
  
  return { success: true, discount: pointsToUse }; // 1 point = ₹1 discount
};

// Static methods
userSchema.statics.findByMobile = function(mobile) {
  return this.findOne({ mobile, status: 'active' });
};

userSchema.statics.getActiveUsersCount = function() {
  return this.countDocuments({ status: 'active' });
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Update loyalty points calculation
  if (this.loyaltyPoints) {
    this.loyaltyPoints.available = this.loyaltyPoints.total - this.loyaltyPoints.used;
  }
  next();
});

// Clean up expired OTPs periodically
userSchema.statics.cleanupExpiredOTPs = function() {
  return this.updateMany(
    { 'otp.expiresAt': { $lt: new Date() } },
    { $unset: { otp: 1 } }
  );
};

module.exports = mongoose.model('User', userSchema);