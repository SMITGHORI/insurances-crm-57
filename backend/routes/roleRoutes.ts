
import express from 'express';
import { roleController } from '../controllers/roleController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/roleMiddleware';

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
router.get('/', roleController.loadRoles);

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access  Super Admin only
 */
router.get('/:id', roleController.loadRoleById);

/**
 * @route   GET /api/roles/:id/permissions
 * @desc    Get permissions for a specific role
 * @access  Super Admin only
 */
router.get('/:id/permissions', roleController.loadRolePermissions);

/**
 * @route   PUT /api/roles/:id/permissions
 * @desc    Update permissions for a specific role
 * @access  Super Admin only
 */
router.put('/:id/permissions', roleController.updateRolePermissions);

export default router;
