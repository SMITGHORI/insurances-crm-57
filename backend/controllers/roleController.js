const Joi = require('joi');
const Role = require('../models/Role');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');

// Validation schema for permissions update
const permissionsSchema = Joi.object({
  permissions: Joi.array().items(
    Joi.object({
      module: Joi.string().valid(
        'clients', 'leads', 'quotations', 'policies', 'claims', 
        'invoices', 'agents', 'reports', 'settings', 'activities', 'offers'
      ).required(),
      actions: Joi.array().items(
        Joi.string().valid(
          'view', 'create', 'edit', 'delete', 'export', 
          'approve', 'edit_sensitive', 'edit_status'
        )
      ).min(1).required()
    })
  ).required()
});

/**
 * Load all roles with optional permissions
 * GET /api/roles
 */
const loadRoles = async (req, res, next) => {
  try {
    const includePermissions = req.query.include_permissions === 'true';
    
    let query = Role.find();
    
    if (!includePermissions) {
      query = query.select('-permissions');
    }
    
    const roles = await query.sort({ name: 1 });
    
    return successResponse(res, {
      message: 'Roles retrieved successfully',
      data: roles,
      total: roles.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Load role by ID
 * GET /api/roles/:id
 */
const loadRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    
    return successResponse(res, {
      message: 'Role retrieved successfully',
      data: role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Load permissions for a specific role
 * GET /api/roles/:id/permissions
 */
const loadRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id).select('name displayName permissions');
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    
    return successResponse(res, {
      message: 'Role permissions retrieved successfully',
      data: {
        roleId: role._id,
        name: role.name,
        displayName: role.displayName,
        permissions: role.permissions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update permissions for a specific role
 * PUT /api/roles/:id/permissions
 */
const updateRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const { error, value } = permissionsSchema.validate(req.body);
    if (error) {
      throw new AppError(`Validation error: ${error.details[0].message}`, 400);
    }
    
    const { permissions } = value;
    
    // Find and update the role
    const role = await Role.findById(id);
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    
    // Prevent updating super_admin role permissions
    if (role.name === 'super_admin') {
      throw new AppError('Cannot modify super_admin role permissions', 403);
    }
    
    // Update permissions
    role.permissions = permissions;
    await role.save();
    
    // TODO: Emit event or invalidate cache for real-time updates
    // This could be implemented with WebSockets, Redis pub/sub, or similar
    console.log(`Role ${role.name} permissions updated by user ${req.user?.id}`);
    
    return successResponse(res, {
      message: `${role.displayName} permissions updated successfully`,
      data: {
        roleId: role._id,
        name: role.name,
        displayName: role.displayName,
        permissions: role.permissions,
        permissionCount: role.permissionCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadRoles,
  loadRoleById,
  loadRolePermissions,
  updateRolePermissions
};