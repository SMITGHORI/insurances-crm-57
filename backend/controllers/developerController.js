const Role = require('../models/Role');
const Developer = require('../models/Developer');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Available modules and actions for permissions
const AVAILABLE_MODULES = [
  'clients', 'leads', 'quotations', 'policies', 'claims', 
  'invoices', 'agents', 'reports', 'settings', 'activities', 'offers'
];

const AVAILABLE_ACTIONS = [
  'view', 'create', 'edit', 'delete', 'export', 
  'approve', 'edit_sensitive', 'edit_status'
];

// Validation schemas
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const createDeveloperSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  permissions: Joi.array().items(
    Joi.object({
      module: Joi.string().valid(...AVAILABLE_MODULES).required(),
      actions: Joi.array().items(
        Joi.string().valid(...AVAILABLE_ACTIONS)
      ).min(1).required()
    })
  ).required()
});

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
  role: Joi.string().required(),
  branch: Joi.string().valid('main', 'north', 'south', 'east', 'west').default('main')
});

const permissionSchema = Joi.object({
  module: Joi.string().valid(...AVAILABLE_MODULES).required(),
  actions: Joi.array().items(
    Joi.string().valid(...AVAILABLE_ACTIONS)
  ).min(1).required()
});

const rolePermissionSchema = Joi.object({
  roleId: Joi.string().required(),
  permissions: Joi.array().items(permissionSchema).required()
});

const createRoleSchema = Joi.object({
  name: Joi.string().valid('agent', 'manager', 'admin', 'super_admin').required(),
  displayName: Joi.string().required(),
  permissions: Joi.array().items(permissionSchema).required(),
  isDefault: Joi.boolean().default(false)
});

/**
 * Middleware to authenticate developer using JWT token
 */
const authenticateDeveloper = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token required', 401);
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      if (decoded.type !== 'developer') {
        return errorResponse(res, 'Invalid token type', 401);
      }
      
      // For hardcoded developer
      if (decoded.developerId === 'hardcoded-dev') {
        req.developer = {
          _id: 'hardcoded-dev',
          email: decoded.email,
          name: 'Smeet Ghori',
          isActive: true
        };
      } else {
        // For database developers
        const developer = await Developer.findById(decoded.developerId);
        if (!developer || !developer.isActive) {
          return errorResponse(res, 'Developer not found or inactive', 401);
        }
        req.developer = developer;
      }
      
      next();
    } catch (jwtError) {
      return errorResponse(res, 'Invalid or expired token', 401);
    }
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 500);
  }
};

/**
 * Developer login
 * POST /api/developer/auth
 */
const developerAuth = async (req, res, next) => {
  try {
    const { error } = authSchema.validate(req.body);
    if (error) {
      throw new AppError(`Validation error: ${error.details[0].message}`, 400);
    }
    
    const { email, password } = req.body;
    
    // Hardcoded credentials for initial developer access
    const HARDCODED_DEVELOPER = {
      email: 'info@smeetghori.in',
      password: 'Smeet@123',
      name: 'Smeet Ghori'
    };
    
    let developerData;
    
    // Check hardcoded credentials first
    if (email === HARDCODED_DEVELOPER.email && password === HARDCODED_DEVELOPER.password) {
      developerData = {
        email: HARDCODED_DEVELOPER.email,
        name: HARDCODED_DEVELOPER.name,
        id: 'hardcoded-dev'
      };
    } else {
      // Then check database for other developers
      const developer = await Developer.findOne({ email, isActive: true });
      
      if (!developer || !(await developer.comparePassword(password))) {
        throw new AppError('Invalid developer credentials', 401);
      }
      
      // Update last login
      await developer.updateLastLogin();
      
      developerData = {
        email: developer.email,
        name: developer.name,
        id: developer._id.toString()
      };
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        developerId: developerData.id,
        email: developerData.email,
        type: 'developer'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return successResponse(res, {
      message: 'Developer authenticated successfully',
      data: {
        authenticated: true,
        email: developerData.email,
        name: developerData.name,
        token: token,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new developer account
 * POST /api/developer/register
 */
const createDeveloper = async (req, res, next) => {
  try {
    const { error, value } = createDeveloperSchema.validate(req.body);
    if (error) {
      throw new AppError(`Validation error: ${error.details[0].message}`, 400);
    }
    
    const { name, email, password, permissions } = value;
    
    // Check if developer already exists
    const existingDeveloper = await Developer.findOne({ email });
    if (existingDeveloper) {
      throw new AppError('Developer with this email already exists', 409);
    }
    
    // Create new developer
    const newDeveloper = new Developer({
      name,
      email,
      password
    });
    
    await newDeveloper.save();
    
    return successResponse(res, {
      message: 'Developer account created successfully',
      data: {
        id: newDeveloper._id,
        name: newDeveloper.name,
        email: newDeveloper.email,
        isActive: newDeveloper.isActive,
        createdAt: newDeveloper.createdAt
      }
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available modules and actions
 * GET /api/developer/permissions/schema
 */
const getPermissionSchema = async (req, res, next) => {
  try {
    return successResponse(res, {
      message: 'Permission schema retrieved successfully',
      data: {
        modules: AVAILABLE_MODULES,
        actions: AVAILABLE_ACTIONS,
        schema: {
          permission: {
            module: 'string (enum)',
            actions: 'array of strings (enum)'
          },
          role: {
            name: 'string (enum: agent, manager, admin)',
            displayName: 'string',
            permissions: 'array of permission objects',
            isDefault: 'boolean'
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all roles with permissions
 * GET /api/developer/permissions/roles
 */
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    
    return successResponse(res, {
      message: 'All roles retrieved successfully',
      data: {
        roles: roles,
        total: roles.length,
        summary: roles.map(role => ({
          id: role._id,
          name: role.name,
          displayName: role.displayName,
          permissionCount: role.permissionCount,
          isDefault: role.isDefault
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all roles
 * GET /api/developer/permissions/roles
 */
const getRoles = async (req, res, next) => {
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
 * Get specific role by ID
 * GET /api/developer/permissions/roles/:id
 */
const getRoleById = async (req, res, next) => {
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
 * Create a new role
 * POST /api/developer/permissions/roles
 */
const createRole = async (req, res, next) => {
  try {
    const { error, value } = createRoleSchema.validate(req.body);
    if (error) {
      throw new AppError(`Validation error: ${error.details[0].message}`, 400);
    }
    
    const { name, displayName, permissions, isDefault } = value;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      throw new AppError(`Role '${name}' already exists`, 409);
    }
    
    // Create new role
    const newRole = new Role({
      name,
      displayName,
      permissions,
      isDefault
    });
    
    await newRole.save();
    
    return successResponse(res, {
      message: `Role '${displayName}' created successfully`,
      data: newRole
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update role permissions
 * PUT /api/developer/permissions/roles/:id
 */
const updateRolePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = rolePermissionSchema.validate({ roleId: id, ...req.body });
    
    if (error) {
      throw new AppError(`Validation error: ${error.details[0].message}`, 400);
    }
    
    const { permissions } = value;
    
    const role = await Role.findById(id);
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    
    // Update permissions
    role.permissions = permissions;
    role.updatedAt = new Date();
    
    await role.save();
    
    return successResponse(res, {
      message: `Role '${role.displayName}' permissions updated successfully`,
      data: {
        roleId: role._id,
        name: role.name,
        displayName: role.displayName,
        permissions: role.permissions,
        permissionCount: role.permissionCount,
        updatedAt: role.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a role
 * DELETE /api/developer/permissions/roles/:id
 */
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    
    // Prevent deletion of super_admin role
    if (role.name === 'super_admin') {
      throw new AppError('Cannot delete super_admin role', 403);
    }
    
    // Check if role is default
    if (role.isDefault) {
      throw new AppError('Cannot delete default role', 403);
    }
    
    await Role.findByIdAndDelete(id);
    
    return successResponse(res, {
      message: `Role '${role.displayName}' deleted successfully`,
      data: {
        deletedRole: {
          id: role._id,
          name: role.name,
          displayName: role.displayName
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update permissions for multiple roles
 * PUT /api/developer/permissions/bulk-update
 */
const bulkUpdatePermissions = async (req, res, next) => {
  try {
    const { roles } = req.body;
    
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new AppError('Roles array is required and cannot be empty', 400);
    }
    
    const results = [];
    const errors = [];
    
    for (const roleUpdate of roles) {
      try {
        const { error, value } = rolePermissionSchema.validate(roleUpdate);
        if (error) {
          errors.push({
            roleId: roleUpdate.roleId,
            error: error.details[0].message
          });
          continue;
        }
        
        const { roleId, permissions } = value;
        const role = await Role.findById(roleId);
        
        if (!role) {
          errors.push({
            roleId,
            error: 'Role not found'
          });
          continue;
        }
        
        if (role.name === 'super_admin') {
          errors.push({
            roleId,
            error: 'Cannot modify super_admin role'
          });
          continue;
        }
        
        role.permissions = permissions;
        role.updatedAt = new Date();
        await role.save();
        
        results.push({
          roleId: role._id,
          name: role.name,
          displayName: role.displayName,
          permissionCount: role.permissionCount,
          status: 'updated'
        });
      } catch (err) {
        errors.push({
          roleId: roleUpdate.roleId,
          error: err.message
        });
      }
    }
    
    return successResponse(res, {
      message: `Bulk update completed. ${results.length} roles updated, ${errors.length} errors`,
      data: {
        updated: results,
        errors: errors,
        summary: {
          total: roles.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 * POST /api/developer/users
 */
const createUser = async (req, res, next) => {
  try {
    const { error } = createUserSchema.validate(req.body);
    if (error) {
      throw new AppError(`Validation error: ${error.details[0].message}`, 400);
    }
    
    const { email, password, name, phone, role, branch } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }
    
    // Verify role exists
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      throw new AppError('Invalid role specified', 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phone,
      role,
      branch
    });
    
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return successResponse(res, {
      message: 'User created successfully',
      data: userResponse
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 * GET /api/developer/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('role', 'name displayName')
      .sort({ createdAt: -1 });
    
    return successResponse(res, {
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get permission templates
 * GET /api/developer/permission-templates
 */
const getPermissionTemplates = async (req, res, next) => {
  try {
    const templates = {
      super_admin: {
        name: 'Super Admin',
        description: 'Complete system access with all permissions across all modules',
        permissions: AVAILABLE_MODULES.map(module => ({
          module,
          actions: [...AVAILABLE_ACTIONS]
        }))
      },
      agent: {
        name: 'Insurance Agent',
        description: 'Front-line agent with client interaction and basic policy management',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit'] },
          { module: 'leads', actions: ['view', 'create', 'edit'] },
          { module: 'quotations', actions: ['view', 'create', 'edit'] },
          { module: 'policies', actions: ['view', 'create'] },
          { module: 'claims', actions: ['view', 'create'] },
          { module: 'activities', actions: ['view', 'create'] },
          { module: 'offers', actions: ['view', 'create'] }
        ]
      },
      senior_agent: {
        name: 'Senior Agent',
        description: 'Experienced agent with enhanced permissions and mentoring capabilities',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'approve'] },
          { module: 'policies', actions: ['view', 'create', 'edit'] },
          { module: 'claims', actions: ['view', 'create', 'edit'] },
          { module: 'invoices', actions: ['view', 'create'] },
          { module: 'agents', actions: ['view'] },
          { module: 'activities', actions: ['view', 'create', 'edit'] },
          { module: 'offers', actions: ['view', 'create', 'edit'] }
        ]
      },
      team_lead: {
        name: 'Team Lead',
        description: 'Team leadership role with agent management and performance oversight',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'approve'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'approve'] },
          { module: 'invoices', actions: ['view', 'create', 'edit'] },
          { module: 'agents', actions: ['view', 'create', 'edit'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'activities', actions: ['view', 'create', 'edit'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'approve'] }
        ]
      },
      manager: {
        name: 'Branch Manager',
        description: 'Branch-level management with comprehensive oversight and approval authority',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'approve', 'export'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'activities', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'approve', 'delete'] }
        ]
      },
      customer_service: {
        name: 'Customer Service',
        description: 'Customer support role with limited access for assistance and inquiries',
        permissions: [
          { module: 'clients', actions: ['view', 'edit'] },
          { module: 'policies', actions: ['view'] },
          { module: 'claims', actions: ['view', 'create', 'edit'] },
          { module: 'activities', actions: ['view', 'create'] },
          { module: 'invoices', actions: ['view'] }
        ]
      },
      underwriter: {
        name: 'Underwriter',
        description: 'Risk assessment specialist with policy evaluation and approval authority',
        permissions: [
          { module: 'clients', actions: ['view'] },
          { module: 'quotations', actions: ['view', 'edit', 'approve'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'approve'] },
          { module: 'claims', actions: ['view', 'approve'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'activities', actions: ['view', 'create'] }
        ]
      },
      admin: {
        name: 'System Administrator',
        description: 'Technical administrator with system management and user administration',
        permissions: [
          { module: 'clients', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'leads', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'quotations', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'policies', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'claims', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'invoices', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'agents', actions: ['view', 'create', 'edit', 'delete', 'export'] },
          { module: 'reports', actions: ['view', 'export'] },
          { module: 'settings', actions: ['view', 'create', 'edit'] },
          { module: 'activities', actions: ['view', 'create', 'edit', 'delete'] },
          { module: 'offers', actions: ['view', 'create', 'edit', 'delete', 'export'] }
        ]
      }
    };
    
    return successResponse(res, {
      message: 'Permission templates retrieved successfully',
      data: templates
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateDeveloper,
  developerAuth,
  createDeveloper,
  createUser,
  getUsers,
  getPermissionTemplates,
  getRoles,
  getRoleById,
  createRole,
  updateRolePermissions,
  deleteRole,
  bulkUpdatePermissions
};