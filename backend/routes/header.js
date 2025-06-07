
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');

// Import controllers
const {
  getProfileData,
  getNotifications,
  getMessages,
  markNotificationAsRead,
  markMessageAsRead
} = require('../controllers/headerController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/header/profile
 * @desc    Get header profile data
 * @access  Private
 */
router.get('/profile', getProfileData);

/**
 * @route   GET /api/header/notifications
 * @desc    Get notifications for header dropdown
 * @access  Private
 */
router.get('/notifications', getNotifications);

/**
 * @route   GET /api/header/messages
 * @desc    Get messages for header dropdown
 * @access  Private
 */
router.get('/messages', getMessages);

/**
 * @route   PUT /api/header/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read', markNotificationAsRead);

/**
 * @route   PUT /api/header/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/messages/:id/read', markMessageAsRead);

module.exports = router;
