const { AppError } = require('../utils/errorHandler');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if the authenticated user has the required permissions to access a resource
 */

/**
 * Check if user has specific permission
 * @param {string} module - The module name (e.g., 'clients', 'leads')
 * @param {string} action - The action name (e.g., 'view', 'create', 'edit', 'delete')
 * @returns {Function} Express middleware function
 */
const requirePermission = (module, action) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has the required permission
      if (!req.user.hasPermission || !req.user.hasPermission(module, action)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${module}:${action}`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check if user has any of the specified permissions
 * @param {Array} permissions - Array of permission objects [{module, action}, ...]
 * @returns {Function} Express middleware function
 */
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has any of the required permissions
      const hasPermission = permissions.some(({ module, action }) => {
        return req.user.hasPermission && req.user.hasPermission(module, action);
      });

      if (!hasPermission) {
        const permissionStrings = permissions.map(p => `${p.module}:${p.action}`);
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permissions (any): ${permissionStrings.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check if user has all of the specified permissions
 * @param {Array} permissions - Array of permission objects [{module, action}, ...]
 * @returns {Function} Express middleware function
 */
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has all of the required permissions
      const hasAllPermissions = permissions.every(({ module, action }) => {
        return req.user.hasPermission && req.user.hasPermission(module, action);
      });

      if (!hasAllPermissions) {
        const permissionStrings = permissions.map(p => `${p.module}:${p.action}`);
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permissions (all): ${permissionStrings.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check if user has specific role
 * @param {string|Array} roles - Role name(s) to check
 * @returns {Function} Express middleware function
 */
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has the required role
      const userRole = req.user.role?.name;
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Check if user is super admin
 * @returns {Function} Express middleware function
 */
const requireSuperAdmin = () => {
  return requireRole('super_admin');
};

/**
 * Check if user is admin or super admin
 * @returns {Function} Express middleware function
 */
const requireAdmin = () => {
  return requireRole(['admin', 'super_admin']);
};

/**
 * Check if user is manager, admin, or super admin
 * @returns {Function} Express middleware function
 */
const requireManager = () => {
  return requireRole(['manager', 'admin', 'super_admin']);
};

/**
 * Middleware to attach user permissions to request for easy access
 * This should be used after authentication middleware
 */
const attachPermissions = (req, res, next) => {
  try {
    if (req.user && req.user.role && req.user.role.permissions) {
      // Create a flat array of permission strings for easy checking
      req.userPermissions = req.user.role.permissions.flatMap(p => 
        p.actions.map(action => `${p.module}:${action}`)
      );
      
      // Add helper function to check permissions
      req.hasPermission = (module, action) => {
        return req.userPermissions.includes(`${module}:${action}`);
      };
    }
    
    next();
  } catch (error) {
    console.error('Attach permissions middleware error:', error);
    next();
  }
};

/**
 * Resource ownership middleware
 * Checks if the user owns the resource or has admin privileges
 * @param {string} resourceField - Field name that contains the owner ID (default: 'userId')
 * @returns {Function} Express middleware function
 */
const requireOwnership = (resourceField = 'userId') => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Super admins and admins can access any resource
      const userRole = req.user.role?.name;
      if (['super_admin', 'admin'].includes(userRole)) {
        return next();
      }

      // Check if resource belongs to the user
      const resourceOwnerId = req.resource?.[resourceField] || req.params.userId;
      if (resourceOwnerId && resourceOwnerId.toString() === req.user._id.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    } catch (error) {
      console.error('Ownership middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireSuperAdmin,
  requireAdmin,
  requireManager,
  attachPermissions,
  requireOwnership
};