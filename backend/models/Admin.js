const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, and underscores'
    }
  },
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
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'manager', 'staff'],
    default: 'admin'
  },
  permissions: {
    canManageOrders: { type: Boolean, default: true },
    canManageMenu: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: true },
    canManageUsers: { type: Boolean, default: false },
    canManageStaff: { type: Boolean, default: false }
  },
  profile: {
    fullName: {
      type: String,
      trim: true,
      maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    avatar: String,
    department: {
      type: String,
      enum: ['kitchen', 'service', 'management', 'operations'],
      default: 'operations'
    }
  },
  otp: {
    code: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: Date,
    lockedUntil: Date
  },
  sessions: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    ipAddress: String,
    userAgent: String
  }],
  activityLog: [{
    action: {
      type: String,
      enum: [
        'login',
        'logout',
        'order_updated',
        'menu_updated',
        'user_managed',
        'report_viewed',
        'settings_changed'
      ]
    },
    details: String,
    timestamp: { type: Date, default: Date.now },
    ipAddress: String
  }]
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.otp;
      delete ret.sessions;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
adminSchema.index({ username: 1 });
adminSchema.index({ mobile: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ role: 1 });

// Virtual for account lock status
adminSchema.virtual('isLocked').get(function() {
  return !!(this.loginAttempts.lockedUntil && this.loginAttempts.lockedUntil > Date.now());
});

// Methods
adminSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0
  };
  return otp;
};

adminSchema.methods.verifyOTP = function(enteredOTP) {
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
  this.otp = undefined; // Clear OTP after successful verification
  this.lastLogin = new Date();
  this.loginAttempts.count = 0; // Reset login attempts
  
  return { success: true, message: 'OTP verified successfully' };
};

adminSchema.methods.comparePassword = function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compareSync(candidatePassword, this.password);
};

adminSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous attempt and its within the lock time, increment
  if (this.loginAttempts.count < 5) {
    this.loginAttempts.count += 1;
    this.loginAttempts.lastAttempt = new Date();
  }
  
  // If we have max attempts, lock the account
  if (this.loginAttempts.count >= 5 && !this.loginAttempts.lockedUntil) {
    this.loginAttempts.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lock
  }
  
  return this.save();
};

adminSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts.count = 0;
  this.loginAttempts.lastAttempt = undefined;
  this.loginAttempts.lockedUntil = undefined;
  return this.save();
};

adminSchema.methods.logActivity = function(action, details, ipAddress) {
  this.activityLog.push({
    action,
    details,
    timestamp: new Date(),
    ipAddress
  });
  
  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
  
  return this.save();
};

adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super-admin') return true;
  return this.permissions[permission] === true;
};

// Static methods
adminSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase(), isActive: true });
};

adminSchema.statics.findByMobile = function(mobile) {
  return this.findOne({ mobile, isActive: true });
};

adminSchema.statics.getActiveAdmins = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Pre-save middleware to hash password
adminSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});

// Pre-save middleware to clean up expired sessions
adminSchema.pre('save', function(next) {
  if (this.sessions && this.sessions.length > 0) {
    this.sessions = this.sessions.filter(session => 
      session.expiresAt && session.expiresAt > new Date()
    );
  }
  next();
});

module.exports = mongoose.model('Admin', adminSchema);