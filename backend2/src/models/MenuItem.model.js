const mongoose = require('mongoose');
const appConfig = require('../config/app.config');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: appConfig.categories,
      lowercase: true,
      index: true,
    },
    halfPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    fullPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
    },
    cloudinaryId: {
      type: String, // For Cloudinary image deletion
    },
    inStock: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Validation: At least one price must be provided
menuItemSchema.pre('validate', function (next) {
  if (!this.halfPrice && !this.fullPrice) {
    next(new Error('At least one price (half or full) must be provided'));
  } else {
    next();
  }
});

// Indexes for better performance
menuItemSchema.index({ category: 1, inStock: 1, isActive: 1 });
// menuItemSchema.index({ isActive: 1 });
menuItemSchema.index({ name: 'text' }); // Text search index

// Virtual for availability status
menuItemSchema.virtual('available').get(function () {
  return this.inStock && this.isActive;
});

// Static method to find by category
menuItemSchema.statics.findByCategory = function (category, includeOutOfStock = true) {
  const query = { category, isActive: true };
  if (!includeOutOfStock) {
    query.inStock = true;
  }
  return this.find(query).sort({ name: 1 });
};

// Static method to search items
menuItemSchema.statics.searchItems = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  }).sort({ score: { $meta: 'textScore' } });
};

// Method to toggle stock status
menuItemSchema.methods.toggleStock = function () {
  this.inStock = !this.inStock;
  return this.save();
};

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;