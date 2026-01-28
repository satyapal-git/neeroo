const Cart = require('../models/Cart.model');
const MenuItem = require('../models/MenuItem.model');
const { successResponse, errorResponse } = require('../utils/response.util');
const logger = require('../utils/logger.util');

/**
 * @desc    Get User Cart
 * @route   GET /api/cart
 * @access  Private (User)
 */
const getCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.userId);

    return successResponse(res, 'Cart fetched successfully', {
      cart: {
        _id: cart._id,
        items: cart.items,
        subtotal: cart.subtotal,
        gst: cart.gst,
        total: cart.total,
        itemCount: cart.itemCount,
        lastUpdated: cart.lastUpdated,
      },
    });

  } catch (error) {
    logger.error(`Get Cart Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Add Item to Cart
 * @route   POST /api/cart/items
 * @access  Private (User)
 */
const addToCart = async (req, res) => {
  try {
    const { itemId, portion, quantity } = req.body;

    // Verify item exists and is in stock
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem || !menuItem.isActive) {
      return errorResponse(res, 'Menu item not found', 404);
    }

    if (!menuItem.inStock) {
      return errorResponse(res, 'Item is out of stock', 400);
    }

    // Get or create cart
    const cart = await Cart.getOrCreateCart(req.userId);

    // Determine price based on portion
    const price = portion === 'half' ? menuItem.halfPrice : menuItem.fullPrice || menuItem.halfPrice;

    if (!price) {
      return errorResponse(res, 'Invalid portion selected', 400);
    }

    // Add item to cart
    cart.addItem({
      itemId: menuItem._id,
      name: `${menuItem.name}${portion === 'half' ? ' (Half)' : portion === 'full' ? ' (Full)' : ''}`,
      price,
      quantity: quantity || 1,
      portion,
      image: menuItem.image,
    });

    await cart.save();

    logger.info(`Item added to cart: ${menuItem.name} by user ${req.userId}`);

    return successResponse(res, 'Item added to cart successfully', {
      cart: {
        items: cart.items,
        subtotal: cart.subtotal,
        gst: cart.gst,
        total: cart.total,
        itemCount: cart.itemCount,
      },
    });

  } catch (error) {
    logger.error(`Add to Cart Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update Cart Item Quantity
 * @route   PUT /api/cart/items/:itemId
 * @access  Private (User)
 */
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { portion, quantity } = req.body;

    const cart = await Cart.getOrCreateCart(req.userId);

    cart.updateItemQuantity(itemId, portion, quantity);
    await cart.save();

    logger.info(`Cart updated by user ${req.userId}`);

    return successResponse(res, 'Cart updated successfully', {
      cart: {
        items: cart.items,
        subtotal: cart.subtotal,
        gst: cart.gst,
        total: cart.total,
        itemCount: cart.itemCount,
      },
    });

  } catch (error) {
    logger.error(`Update Cart Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Remove Item from Cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private (User)
 */
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { portion } = req.query;

    const cart = await Cart.getOrCreateCart(req.userId);

    cart.removeItem(itemId, portion);
    await cart.save();

    logger.info(`Item removed from cart by user ${req.userId}`);

    return successResponse(res, 'Item removed from cart successfully', {
      cart: {
        items: cart.items,
        subtotal: cart.subtotal,
        gst: cart.gst,
        total: cart.total,
        itemCount: cart.itemCount,
      },
    });

  } catch (error) {
    logger.error(`Remove from Cart Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Clear Cart
 * @route   DELETE /api/cart
 * @access  Private (User)
 */
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.userId);

    cart.clearCart();
    await cart.save();

    logger.info(`Cart cleared by user ${req.userId}`);

    return successResponse(res, 'Cart cleared successfully', {
      cart: {
        items: [],
        subtotal: 0,
        gst: 0,
        total: 0,
        itemCount: 0,
      },
    });

  } catch (error) {
    logger.error(`Clear Cart Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Sync Cart (for offline support)
 * @route   POST /api/cart/sync
 * @access  Private (User)
 */
const syncCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return errorResponse(res, 'Invalid cart data', 400);
    }

    const cart = await Cart.getOrCreateCart(req.userId);

    // Clear existing items
    cart.items = [];

    // Add all items from frontend
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);
      
      if (menuItem && menuItem.isActive && menuItem.inStock) {
        cart.items.push({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          portion: item.portion,
          image: item.image || menuItem.image,
        });
      }
    }

    cart.calculateTotals();
    await cart.save();

    logger.info(`Cart synced for user ${req.userId}`);

    return successResponse(res, 'Cart synced successfully', {
      cart: {
        items: cart.items,
        subtotal: cart.subtotal,
        gst: cart.gst,
        total: cart.total,
        itemCount: cart.itemCount,
      },
    });

  } catch (error) {
    logger.error(`Sync Cart Error: ${error.message}`);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};