
const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { authenticate, authorize } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const { validate } = require('../middleware/validation');
const { 
  interactionValidation, 
  updateInteractionValidation,
  attachmentValidation 
} = require('../validations/interactionValidation');

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/interactions
 * @desc Get all interactions with filtering and pagination
 * @access Private (agents see only their interactions)
 */
router.get('/', 
  authorize(['super_admin', 'manager', 'agent']),
  interactionController.getAllInteractions
);

/**
 * @route GET /api/interactions/:id
 * @desc Get interaction by ID
 * @access Private
 */
router.get('/:id', 
  authorize(['super_admin', 'manager', 'agent']),
  interactionController.getInteractionById
);

/**
 * @route POST /api/interactions
 * @desc Create new interaction
 * @access Private
 */
router.post('/', 
  authorize(['super_admin', 'manager', 'agent']),
  validate(interactionValidation),
  interactionController.createInteraction
);

/**
 * @route PUT /api/interactions/:id
 * @desc Update interaction
 * @access Private
 */
router.put('/:id', 
  authorize(['super_admin', 'manager', 'agent']),
  validate(updateInteractionValidation),
  interactionController.updateInteraction
);

/**
 * @route DELETE /api/interactions/:id
 * @desc Delete interaction
 * @access Private (Super Admin only)
 */
router.delete('/:id', 
  authorize(['super_admin']),
  interactionController.deleteInteraction
);

/**
 * @route GET /api/interactions/client/:clientId
 * @desc Get interactions by client
 * @access Private
 */
router.get('/client/:clientId', 
  authorize(['super_admin', 'manager', 'agent']),
  interactionController.getInteractionsByClient
);

/**
 * @route POST /api/interactions/:id/attachments
 * @desc Upload interaction attachment
 * @access Private
 */
router.post('/:id/attachments', 
  authorize(['super_admin', 'manager', 'agent']),
  uploadMiddleware.single('attachment'),
  validate(attachmentValidation),
  interactionController.uploadAttachment
);

/**
 * @route GET /api/interactions/stats/summary
 * @desc Get interaction statistics
 * @access Private
 */
router.get('/stats/summary', 
  authorize(['super_admin', 'manager', 'agent']),
  interactionController.getInteractionStats
);

module.exports = router;
