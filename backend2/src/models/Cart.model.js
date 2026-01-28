const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
      index: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
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
          default: 1,
        },
        portion: {
          type: String,
          enum: ['half', 'full', 'single'],
          default: 'full',
        },
        image: String,
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    gst: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// cartSchema.index({ userId: 1 });
cartSchema.index({ updatedAt: -1 });

// Auto-delete cart after 7 days of inactivity
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Method to calculate totals
cartSchema.methods.calculateTotals = function () {
  const subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;
  const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);

  this.subtotal = subtotal;
  this.gst = gst;
  this.total = total;
  this.itemCount = itemCount;
  this.lastUpdated = new Date();

  return this;
};

// Method to add item to cart
cartSchema.methods.addItem = function (itemData) {
  const itemKey = `${itemData.itemId}_${itemData.portion}`;
  
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(
    (item) => 
      item.itemId.toString() === itemData.itemId.toString() &&
      item.portion === itemData.portion
  );

  if (existingItemIndex > -1) {
    // Update quantity
    this.items[existingItemIndex].quantity += itemData.quantity || 1;
  } else {
    // Add new item
    this.items.push(itemData);
  }

  this.calculateTotals();
  return this;
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (itemId, portion, quantity) {
  const itemIndex = this.items.findIndex(
    (item) =>
      item.itemId.toString() === itemId.toString() &&
      item.portion === portion
  );

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
    this.calculateTotals();
  }

  return this;
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (itemId, portion) {
  this.items = this.items.filter(
    (item) =>
      !(
        item.itemId.toString() === itemId.toString() &&
        item.portion === portion
      )
  );
  this.calculateTotals();
  return this;
};

// Method to clear cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.subtotal = 0;
  this.gst = 0;
  this.total = 0;
  this.itemCount = 0;
  this.lastUpdated = new Date();
  return this;
};

// Static method to get or create cart
cartSchema.statics.getOrCreateCart = async function (userId) {
  let cart = await this.findOne({ userId }).populate('items.itemId', 'name image inStock');

  if (!cart) {
    cart = await this.create({ userId, items: [] });
  }

  return cart;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;