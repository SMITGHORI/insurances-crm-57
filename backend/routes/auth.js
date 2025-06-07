
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');

// Import controllers
const {
  logout,
  getAuthenticatedUser,
  refreshSession
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear session
 * @access  Private
 */
router.post('/logout',
  authMiddleware,
  logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me',
  authMiddleware,
  getAuthenticatedUser
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh user session
 * @access  Private
 */
router.post('/refresh',
  authMiddleware,
  refreshSession
);

module.exports = router;
