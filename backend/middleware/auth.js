
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No valid token provided.', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('role');

    if (!user) {
      throw new AppError('Invalid token. User not found.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive. Contact administrator.', 401);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token.', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired.', 401));
    } else {
      next(error);
    }
  }
};

module.exports = authMiddleware;
