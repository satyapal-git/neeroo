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
// adminSchema.index({ mobile: 1 });
// adminSchema.index({ email: 1 });
// adminSchema.index({ restaurantId: 1 });

// Method to update last login
adminSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find by mobile
adminSchema.statics.findByMobile = function (mobile) {
  return this.findOne({ mobile, isActive: true });
};

// Static method to find by email
adminSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

// Static method to find by restaurant ID
adminSchema.statics.findByRestaurantId = function (restaurantId) {
  return this.findOne({ restaurantId: restaurantId.toUpperCase(), isActive: true });
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;