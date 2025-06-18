
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route GET /api/dashboard/overview
 * @desc Get dashboard overview with role-based data
 * @access Private (All roles with filtered data)
 */
router.get('/overview', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  dashboardController.getDashboardOverview
);

/**
 * @route GET /api/dashboard/activities
 * @desc Get recent activities with role-based filtering
 * @access Private (All roles)
 */
router.get('/activities', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  dashboardController.getRecentActivities
);

/**
 * @route GET /api/dashboard/performance
 * @desc Get performance metrics
 * @access Private (All roles)
 */
router.get('/performance', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  dashboardController.getPerformanceMetrics
);

/**
 * @route GET /api/dashboard/charts
 * @desc Get charts data for visualization
 * @access Private (All roles)
 */
router.get('/charts', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  dashboardController.getChartsData
);

/**
 * @route GET /api/dashboard/quick-actions
 * @desc Get quick actions data
 * @access Private (All roles)
 */
router.get('/quick-actions', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  dashboardController.getQuickActions
);

/**
 * @route POST /api/dashboard/refresh
 * @desc Refresh dashboard data
 * @access Private (All roles)
 */
router.post('/refresh', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  dashboardController.refreshDashboard
);

module.exports = router;
