
const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { 
  followUpValidation, 
  updateFollowUpValidation,
  completeFollowUpValidation 
} = require('../validations/followUpValidation');

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/follow-ups
 * @desc Get all follow-ups with filtering and pagination
 * @access Private (agents see only their follow-ups)
 */
router.get('/', 
  authorize(['super_admin', 'manager', 'agent']),
  followUpController.getAllFollowUps
);

/**
 * @route GET /api/follow-ups/:id
 * @desc Get follow-up by ID
 * @access Private
 */
router.get('/:id', 
  authorize(['super_admin', 'manager', 'agent']),
  followUpController.getFollowUpById
);

/**
 * @route POST /api/follow-ups
 * @desc Create new follow-up
 * @access Private
 */
router.post('/', 
  authorize(['super_admin', 'manager', 'agent']),
  validate(followUpValidation),
  followUpController.createFollowUp
);

/**
 * @route PUT /api/follow-ups/:id
 * @desc Update follow-up
 * @access Private
 */
router.put('/:id', 
  authorize(['super_admin', 'manager', 'agent']),
  validate(updateFollowUpValidation),
  followUpController.updateFollowUp
);

/**
 * @route POST /api/follow-ups/:id/complete
 * @desc Complete follow-up
 * @access Private
 */
router.post('/:id/complete', 
  authorize(['super_admin', 'manager', 'agent']),
  validate(completeFollowUpValidation),
  followUpController.completeFollowUp
);

/**
 * @route GET /api/follow-ups/today/list
 * @desc Get follow-ups due today
 * @access Private
 */
router.get('/today/list', 
  authorize(['super_admin', 'manager', 'agent']),
  followUpController.getTodaysFollowUps
);

/**
 * @route GET /api/follow-ups/overdue/list
 * @desc Get overdue follow-ups
 * @access Private
 */
router.get('/overdue/list', 
  authorize(['super_admin', 'manager', 'agent']),
  followUpController.getOverdueFollowUps
);

/**
 * @route GET /api/follow-ups/stats/summary
 * @desc Get follow-up statistics
 * @access Private
 */
router.get('/stats/summary', 
  authorize(['super_admin', 'manager', 'agent']),
  followUpController.getFollowUpStats
);

module.exports = router;
