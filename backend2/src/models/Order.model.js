const mongoose = require('mongoose');
const { ORDER_STATUS, ORDER_TYPE, PORTION_TYPE } = require('../constants/status.constant');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userMobile: {
      type: String,
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        portion: {
          type: String,
          enum: Object.values(PORTION_TYPE),
          default: PORTION_TYPE.FULL,
        },
      },
    ],
    orderType: {
      type: String,
      enum: Object.values(ORDER_TYPE),
      required: true,
    },
    tableNumber: {
      type: String,
      trim: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    gst: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(ORDER_STATUS),
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Admin',
        },
      },
    ],
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
// orderSchema.index({ orderId: 1 });

// Validation: Table number required for dine-in
orderSchema.pre('validate', function (next) {
  if (this.orderType === ORDER_TYPE.DINE_IN && !this.tableNumber) {
    next(new Error('Table number is required for dine-in orders'));
  } else {
    next();
  }
});

// Method to update status
orderSchema.methods.updateStatus = function (newStatus, adminId) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: adminId,
  });
  return this.save();
};

// Static method to generate order ID
orderSchema.statics.generateOrderId = async function () {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SP${timestamp}${random}`;
};

// Static method to get today's orders
orderSchema.statics.getTodayOrders = function () {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });
};

// Static method to get statistics
orderSchema.statics.getStatistics = async function () {
  const today = await this.getTodayOrders();
  
  const stats = {
    totalOrders: today.length,
    pendingOrders: today.filter(o => o.status === ORDER_STATUS.PENDING).length,
    preparingOrders: today.filter(o => o.status === ORDER_STATUS.PREPARING).length,
    readyOrders: today.filter(o => o.status === ORDER_STATUS.READY).length,
    deliveredOrders: today.filter(o => o.status === ORDER_STATUS.DELIVERED).length,
    todayRevenue: today.reduce((sum, order) => sum + order.total, 0),
  };
  
  return stats;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;