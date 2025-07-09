
const { AppError } = require('../utils/errorHandler');

/**
 * Role-based access control middleware
 * @param {Array} allowedRoles - Array of roles that can access the route
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      if (!allowedRoles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has specific permission
 * @param {String} permission - Permission to check
 */
const permissionMiddleware = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      // Check if user has the required permission
      // This can be expanded based on your permission system
      const userPermissions = req.user.permissions || [];
      
      if (!userPermissions.includes(permission)) {
        return next(new AppError('Insufficient permissions', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user owns the resource or has admin role
 * @param {String} resourceIdField - Field name that contains the resource owner ID
 */
const ownershipMiddleware = (resourceIdField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      // Admin users can access any resource
      if (req.user.role === 'super_admin' || req.user.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      const resourceOwnerId = req.params[resourceIdField] || req.body[resourceIdField];
      
      if (resourceOwnerId && resourceOwnerId.toString() !== req.user._id.toString()) {
        return next(new AppError('You can only access your own resources', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  roleMiddleware,
  permissionMiddleware,
  ownershipMiddleware
};
