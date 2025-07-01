const express = require('express');
const { loadRoles, loadRoleById, loadRolePermissions, updateRolePermissions } = require('../controllers/roleController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply super_admin role requirement to all routes
router.use(roleMiddleware(['super_admin']));

/**
 * @route   GET /api/roles
 * @desc    Get all roles with optional permissions
 * @access  Super Admin only
 * @query   include_permissions: boolean - Include permission details
 */
router.get('/', loadRoles);

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access  Super Admin only
 */
router.get('/:id', loadRoleById);

/**
 * @route   GET /api/roles/:id/permissions
 * @desc    Get permissions for a specific role
 * @access  Super Admin only
 */
router.get('/:id/permissions', loadRolePermissions);

/**
 * @route   PUT /api/roles/:id/permissions
 * @desc    Update permissions for a specific role
 * @access  Super Admin only
 */
router.put('/:id/permissions', updateRolePermissions);

module.exports = router;