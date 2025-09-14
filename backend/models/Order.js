const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: [true, 'Item ID is required']
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Item price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: [200, 'Special instructions cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['starters', 'maincourse', 'desserts', 'drinks'],
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  userMobile: {
    type: String,
    required: [true, 'User mobile is required']
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item'
    }
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway'],
    required: [true, 'Order type is required']
  },
  tableNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Table number is required only for dine-in orders
        return this.orderType !== 'dine-in' || (v && v.length > 0);
      },
      message: 'Table number is required for dine-in orders'
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    gst: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: String, // admin username who updated the status
    notes: String
  }],
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  actualTime: {
    type: Number // in minutes, calculated when order is delivered
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  customerFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    submittedAt: Date
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [300, 'Special requests cannot exceed 300 characters']
  },
  deliveryDetails: {
    assignedTo: String, // staff member name
    startedAt: Date,
    deliveredAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ userMobile: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderType: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order duration
orderSchema.virtual('orderDuration').get(function() {
  if (this.deliveryDetails && this.deliveryDetails.deliveredAt) {
    return Math.round((this.deliveryDetails.deliveredAt - this.createdAt) / (1000 * 60)); // in minutes
  }
  return null;
});

// Pre-save middleware to generate order ID
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.orderId = 'SP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

// Pre-save middleware to calculate pricing
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.pricing.subtotal = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // Calculate GST (5%)
    this.pricing.gst = Math.round(this.pricing.subtotal * 0.05);
    
    // Calculate total
    this.pricing.total = this.pricing.subtotal + this.pricing.gst - this.pricing.discount - this.pricing.loyaltyPointsUsed;
  }
  next();
});

// Methods
orderSchema.methods.updateStatus = function(newStatus, updatedBy, notes) {
  // Add to status history
  this.statusHistory.push({
    status: this.status, // previous status
    timestamp: new Date(),
    updatedBy: updatedBy,
    notes: notes
  });
  
  // Update current status
  this.status = newStatus;
  
  // Update delivery details based on status
  if (newStatus === 'preparing' && !this.deliveryDetails.startedAt) {
    this.deliveryDetails.startedAt = new Date();
  } else if (newStatus === 'delivered' && !this.deliveryDetails.deliveredAt) {
    this.deliveryDetails.deliveredAt = new Date();
    this.actualTime = Math.round((this.deliveryDetails.deliveredAt - this.createdAt) / (1000 * 60));
  }
  
  return this.save();
};

orderSchema.methods.addFeedback = function(rating, comment) {
  this.customerFeedback = {
    rating: rating,
    comment: comment,
    submittedAt: new Date()
  };
  return this.save();
};

orderSchema.methods.calculateEstimatedTime = function() {
  // Base time calculation based on items
  let baseTime = 15; // minimum 15 minutes
  
  // Add time based on number of items
  baseTime += this.totalItems * 2;
  
  // Add extra time for complex items (main course items take longer)
  const complexItems = this.items.filter(item => item.category === 'maincourse').length;
  baseTime += complexItems * 5;
  
  // Add buffer time during peak hours
  const currentHour = new Date().getHours();
  if ((currentHour >= 12 && currentHour <= 14) || (currentHour >= 19 && currentHour <= 21)) {
    baseTime += 10; // peak hours buffer
  }
  
  this.estimatedTime = Math.min(baseTime, 60); // max 60 minutes
  return this.estimatedTime;
};

// Static methods
orderSchema.statics.findByOrderId = function(orderId) {
  return this.findOne({ orderId }).populate('userId', 'mobile profile');
};

orderSchema.statics.findByUser = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'mobile profile');
};

orderSchema.statics.getTodaysOrders = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    createdAt: { $gte: today, $lt: tomorrow }
  }).sort({ createdAt: -1 });
};

orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

orderSchema.statics.getRevenueStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['delivered', 'ready'] },
        'payment.status': 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.total' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$pricing.total' }
      }
    }
  ]);
};

orderSchema.statics.getPopularItems = function(limit = 10) {
  return this.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.itemId',
        name: { $first: '$items.name' },
        category: { $first: '$items.category' },
        totalOrdered: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalOrdered: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);