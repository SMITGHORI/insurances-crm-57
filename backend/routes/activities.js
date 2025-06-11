
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Import controllers
const {
  getActivities,
  getActivityById,
  getActivityStats,
  archiveExpiredActivities,
  getActivitySettings,
  updateActivitySettings,
  searchActivities,
  getFilterValues
} = require('../controllers/activityController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// All routes require super admin access
router.use(roleMiddleware(['super_admin']));

/**
 * @route   GET /api/activities
 * @desc    Get all activities with filtering and pagination
 * @access  Private (Super Admin only)
 */
router.get('/', getActivities);

/**
 * @route   GET /api/activities/stats
 * @desc    Get activity statistics
 * @access  Private (Super Admin only)
 */
router.get('/stats', getActivityStats);

/**
 * @route   GET /api/activities/settings
 * @desc    Get activity settings
 * @access  Private (Super Admin only)
 */
router.get('/settings', getActivitySettings);

/**
 * @route   GET /api/activities/filters
 * @desc    Get unique filter values for dropdowns
 * @access  Private (Super Admin only)
 */
router.get('/filters', getFilterValues);

/**
 * @route   GET /api/activities/search/:query
 * @desc    Search activities by text
 * @access  Private (Super Admin only)
 */
router.get('/search/:query', searchActivities);

/**
 * @route   POST /api/activities/archive-expired
 * @desc    Archive expired activities manually
 * @access  Private (Super Admin only)
 */
router.post('/archive-expired', archiveExpiredActivities);

/**
 * @route   PUT /api/activities/settings
 * @desc    Update activity settings
 * @access  Private (Super Admin only)
 */
router.put('/settings', updateActivitySettings);

/**
 * @route   GET /api/activities/:id
 * @desc    Get activity by ID
 * @access  Private (Super Admin only)
 */
router.get('/:id', getActivityById);

module.exports = router;
