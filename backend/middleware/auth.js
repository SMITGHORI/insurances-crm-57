
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
    
    // Check if this is a fallback user
    if (decoded.userId === 'admin-fallback-id' || decoded.userId === 'agent-fallback-id') {
      // Handle fallback authentication
      let fallbackUser;
      
      if (decoded.userId === 'admin-fallback-id') {
        fallbackUser = {
          _id: 'admin-fallback-id',
          email: 'admin@gmail.com',
          firstName: 'Admin',
          lastName: 'User',
          role: {
            name: 'super_admin',
            displayName: 'Super Administrator',
            permissions: [
              { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export', 'edit_sensitive'] },
              { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
              { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'export'] },
              { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'edit_sensitive'] },
              { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'edit_status'] },
              { module: 'invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
              { module: 'agents', actions: ['view', 'create', 'edit', 'delete', 'export'] },
              { module: 'activities', actions: ['view', 'create', 'edit', 'delete', 'export'] },
              { module: 'offers', actions: ['view', 'create', 'edit', 'delete', 'export'] },
              { module: 'reports', actions: ['view', 'export'] },
              { module: 'settings', actions: ['view', 'edit', 'export'] }
            ]
          },
          branch: 'main',
          isActive: true,
          isFallbackUser: true // Flag to identify fallback users
        };
      } else if (decoded.userId === 'agent-fallback-id') {
        fallbackUser = {
          _id: 'agent-fallback-id',
          email: 'agent@gmail.com',
          firstName: 'Test',
          lastName: 'Agent',
          role: {
            name: 'agent',
            displayName: 'Sales Agent',
            permissions: [
              { module: 'clients', actions: ['view', 'create', 'edit'] },
              { module: 'leads', actions: ['view', 'create', 'edit'] },
              { module: 'quotations', actions: ['view', 'create', 'edit'] },
              { module: 'policies', actions: ['view', 'create', 'edit'] },
              { module: 'claims', actions: ['view', 'create', 'edit'] }
            ]
          },
          branch: 'branch1',
          isActive: true,
          isFallbackUser: true
        };
      }
      
      req.user = fallbackUser;
      return next();
    }
    
    // Get user from database for regular authentication
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
