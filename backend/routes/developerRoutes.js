const express = require('express');
const {
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
} = require('../controllers/developerController');

const router = express.Router();

/**
 * @route   POST /api/developer/auth
 * @desc    Authenticate developer with hardcoded credentials
 * @access  Public (but requires specific credentials)
 * @body    { email: "info@smeetghori.in", password: "Smeet@123" }
 */
router.post('/auth', developerAuth);

/**
 * @route   POST /api/developer/register
 * @desc    Register a new developer
 * @access  Public
 */
router.post('/register', createDeveloper);

/**
 * @route   POST /api/developer/users
 * @desc    Create a new user
 * @access  Developer only
 */
router.post('/users', authenticateDeveloper, createUser);

/**
 * @route   GET /api/developer/users
 * @desc    Get all users
 * @access  Developer only
 */
router.get('/users', authenticateDeveloper, getUsers);

/**
 * @route   GET /api/developer/permission-templates
 * @desc    Get predefined permission templates
 * @access  Developer only
 */
router.get('/permission-templates', authenticateDeveloper, getPermissionTemplates);

/**
 * @route   GET /api/developer/permissions/roles
 * @desc    Get all roles with their permissions
 * @access  Developer only
 */
router.get('/permissions/roles', authenticateDeveloper, getRoles);

/**
 * @route   GET /api/developer/permissions/roles/:id
 * @desc    Get specific role by ID
 * @access  Developer only
 */
router.get('/permissions/roles/:id', authenticateDeveloper, getRoleById);

/**
 * @route   POST /api/developer/permissions/roles
 * @desc    Create a new role with permissions
 * @access  Developer only
 * @body    {
 *            name: "agent|manager|admin",
 *            displayName: "Role Display Name",
 *            permissions: [{
 *              module: "clients",
 *              actions: ["view", "create"]
 *            }],
 *            isDefault: false
 *          }
 */
router.post('/permissions/roles', authenticateDeveloper, createRole);

/**
 * @route   PUT /api/developer/permissions/roles/:id
 * @desc    Update role permissions
 * @access  Developer only
 * @body    {
 *            permissions: [{
 *              module: "clients",
 *              actions: ["view", "create", "edit"]
 *            }]
 *          }
 */
router.put('/permissions/roles/:id', authenticateDeveloper, updateRolePermissions);

/**
 * @route   DELETE /api/developer/permissions/roles/:id
 * @desc    Delete a role (except super_admin and default roles)
 * @access  Developer only
 */
router.delete('/permissions/roles/:id', authenticateDeveloper, deleteRole);

/**
 * @route   PUT /api/developer/permissions/bulk-update
 * @desc    Bulk update permissions for multiple roles
 * @access  Developer only
 * @body    {
 *            roles: [{
 *              roleId: "role_id_1",
 *              permissions: [{
 *                module: "clients",
 *                actions: ["view", "create"]
 *              }]
 *            }]
 *          }
 */
router.put('/permissions/bulk-update', authenticateDeveloper, bulkUpdatePermissions);

module.exports = router;