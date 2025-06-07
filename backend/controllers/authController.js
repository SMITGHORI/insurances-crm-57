
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * User logout
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Update user's last activity
    await User.findByIdAndUpdate(userId, {
      lastActivity: new Date(),
      isOnline: false
    });
    
    // In a production environment, you might want to:
    // 1. Blacklist the JWT token
    // 2. Clear any active sessions from a session store
    // 3. Log the logout activity
    
    successResponse(res, null, 'Logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Check authentication status
 * @route GET /api/auth/me
 * @access Private
 */
const getAuthenticatedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    successResponse(res, user, 'User authenticated', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh user session
 * @route POST /api/auth/refresh
 * @access Private
 */
const refreshSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Update last activity
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        lastActivity: new Date(),
        isOnline: true 
      },
      { new: true }
    ).select('-password');
    
    successResponse(res, user, 'Session refreshed', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logout,
  getAuthenticatedUser,
  refreshSession
};
