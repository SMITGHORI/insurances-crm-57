
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');

// Import validation schemas
const {
  createActivitySchema,
  updateActivitySchema,
  queryParamsSchema,
  statsQuerySchema,
  bulkActionSchema
} = require('../validations/activityValidation');

// Import controllers
const {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
  searchActivities,
  bulkActions
} = require('../controllers/activityController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/activities
 * @desc    Get all activities with filtering and pagination
 * @access  Private (All authenticated users)
 * @query   page, limit, type, entityType, agentId, clientId, userId, entityId, priority, status, search, sortBy, sortOrder, dateFilter, startDate, endDate, isRecent, tags
 */
router.get('/',
  validationMiddleware(queryParamsSchema, 'query'),
  getActivities
);

/**
 * @route   GET /api/activities/stats
 * @desc    Get activity statistics
 * @access  Private (All authenticated users)
 * @query   agentId, startDate, endDate, period, groupBy
 */
router.get('/stats',
  validationMiddleware(statsQuerySchema, 'query'),
  getActivityStats
);

/**
 * @route   GET /api/activities/search/:query
 * @desc    Search activities by text
 * @access  Private (All authenticated users)
 * @param   query - Search query string
 * @query   limit, type, agentId
 */
router.get('/search/:query',
  searchActivities
);

/**
 * @route   POST /api/activities
 * @desc    Create a new activity
 * @access  Private (All authenticated users)
 * @body    Activity data according to createActivitySchema
 */
router.post('/',
  validationMiddleware(createActivitySchema),
  createActivity
);

/**
 * @route   POST /api/activities/bulk
 * @desc    Perform bulk actions on activities
 * @access  Private (Agents can bulk edit own activities, Managers/Super Admin can bulk edit all)
 * @body    Bulk action data according to bulkActionSchema
 */
router.post('/bulk',
  validationMiddleware(bulkActionSchema),
  bulkActions
);

/**
 * @route   GET /api/activities/:id
 * @desc    Get activity by ID
 * @access  Private (All authenticated users)
 * @param   id - Activity ID
 */
router.get('/:id',
  getActivityById
);

/**
 * @route   PUT /api/activities/:id
 * @desc    Update activity
 * @access  Private (Agents can update own activities, Managers/Super Admin can update all)
 * @param   id - Activity ID
 * @body    Activity update data according to updateActivitySchema
 */
router.put('/:id',
  validationMiddleware(updateActivitySchema),
  updateActivity
);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Delete activity (soft delete)
 * @access  Private (Managers, Super Admin only)
 * @param   id - Activity ID
 */
router.delete('/:id',
  roleMiddleware(['manager', 'super_admin']),
  deleteActivity
);

module.exports = router;
