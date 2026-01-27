const clerkClient = require('../config/clerk');
const User = require('../models/User');

const authenticateWithClerk = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Fallback to existing auth
      return next();
    }

    const sessionToken = authHeader.split(' ')[1];

    // Check if it's a Clerk token
    if (!sessionToken.startsWith('eyJ')) {
      return next();
    }

    try {
      // Verify session with Clerk
      const verifiedSession = await clerkClient.sessions.verifySession(
        sessionToken, 
        sessionToken
      );
      
      if (!verifiedSession) {
        return next();
      }

      // Get user from Clerk
      const clerkUser = await clerkClient.users.getUser(verifiedSession.userId);
      
      // Sync with MongoDB
      let dbUser = await User.findOne({ 
        clerkUserId: verifiedSession.userId 
      });

      if (!dbUser) {
        // Extract phone number
        const phoneNumber = clerkUser.phoneNumbers[0]?.phoneNumber;
        const cleanPhone = phoneNumber ? phoneNumber.replace(/^\+91/, '') : '';
        
        // Create new user
        dbUser = new User({
          clerkUserId: verifiedSession.userId,
          mobile: cleanPhone || 'not_provided',
          isVerified: true,
          profile: {
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
            email: clerkUser.emailAddresses[0]?.emailAddress
          }
        });
        
        await dbUser.save();
      } else {
        // Update last login
        dbUser.lastLogin = new Date();
        await dbUser.save();
      }

      // Attach to request
      req.user = dbUser;
      req.clerkUser = clerkUser;
      req.isClerkAuth = true;
      
      next();
      
    } catch (error) {
      // If Clerk auth fails, continue with existing auth
      return next();
    }

  } catch (error) {
    console.error('Clerk auth middleware error:', error);
    return next();
  }
};

module.exports = { authenticateWithClerk };