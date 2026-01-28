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
// userSchema.index({ mobile: 1 });
userSchema.index({ createdAt: -1 });

// Method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find by mobile
userSchema.statics.findByMobile = function (mobile) {
  return this.findOne({ mobile, isActive: true });
};

const User = mongoose.model('User', userSchema);

module.exports = User;