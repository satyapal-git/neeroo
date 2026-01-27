const express = require('express');
const router = express.Router();
const { authenticateWithClerk } = require('../middleware/clerkAuthMiddleware');
const User = require('../models/User');

// Sync endpoint for Clerk users
router.post('/sync', authenticateWithClerk, async (req, res) => {
  try {
    if (!req.isClerkAuth) {
      return res.status(401).json({
        success: false,
        message: 'Clerk authentication required'
      });
    }

    res.json({
      success: true,
      message: 'User synced successfully',
      user: {
        id: req.user._id,
        mobile: req.user.mobile,
        profile: req.user.profile,
        loyaltyPoints: req.user.loyaltyPoints
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Sync failed'
    });
  }
});

// Get user profile
router.get('/profile', authenticateWithClerk, async (req, res) => {
  try {
    if (!req.isClerkAuth) {
      return res.status(401).json({
        success: false,
        message: 'Clerk authentication required'
      });
    }

    const user = await User.findById(req.user._id)
      .populate('orderHistory', 'orderId status createdAt pricing.total');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

module.exports = router;