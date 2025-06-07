
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');

// Import controllers
const {
  getDashboardOverview,
  getRecentActivities,
  getPerformanceMetrics,
  getChartsData,
  getQuickActions
} = require('../controllers/dashboardController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview statistics
 * @access  Private
 */
router.get('/overview', getDashboardOverview);

/**
 * @route   GET /api/dashboard/activities
 * @desc    Get recent activities for dashboard
 * @access  Private
 */
router.get('/activities', getRecentActivities);

/**
 * @route   GET /api/dashboard/performance
 * @desc    Get performance metrics
 * @access  Private
 */
router.get('/performance', getPerformanceMetrics);

/**
 * @route   GET /api/dashboard/charts
 * @desc    Get dashboard charts data
 * @access  Private
 */
router.get('/charts', getChartsData);

/**
 * @route   GET /api/dashboard/quick-actions
 * @desc    Get quick actions data
 * @access  Private
 */
router.get('/quick-actions', getQuickActions);

module.exports = router;
