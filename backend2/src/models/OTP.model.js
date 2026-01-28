const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid mobile number'],
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      default: 'user',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - auto delete after expiry
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
// otpSchema.index({ mobile: 1, type: 1, verified: 1 });
otpSchema.index({ type: 1, verified: 1 });
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 }); // Auto delete after 10 minutes

// Method to check if OTP is expired
otpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.save();
};

// Method to check if max attempts reached
otpSchema.methods.isMaxAttemptsReached = function () {
  return this.attempts >= this.maxAttempts;
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function (mobile, type) {
  return this.findOne({
    mobile,
    type,
    verified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

// Static method to invalidate old OTPs
otpSchema.statics.invalidateOldOTPs = async function (mobile, type) {
  return this.updateMany(
    {
      mobile,
      type,
      verified: false,
    },
    {
      $set: { verified: true },
    }
  );
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;