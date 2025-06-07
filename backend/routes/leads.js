
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');
const { roleMiddleware, resourceOwnershipMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');

// Import validation schemas
const {
  createLeadSchema,
  updateLeadSchema,
  followUpSchema,
  noteSchema,
  assignmentSchema,
  queryParamsSchema
} = require('../validations/leadValidation');

// Import controllers
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addFollowUp,
  addNote,
  assignLead,
  convertToClient,
  getLeadsStats,
  searchLeads
} = require('../controllers/leadController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route   GET /api/leads
 * @desc    Get all leads with filtering and pagination
 * @access  Private (All authenticated users)
 * @query   page, limit, status, source, priority, assignedTo, search, sortBy, sortOrder
 */
router.get('/',
  validationMiddleware(queryParamsSchema, 'query'),
  resourceOwnershipMiddleware(),
  getLeads
);

/**
 * @route   GET /api/leads/stats
 * @desc    Get leads statistics
 * @access  Private (All authenticated users)
 * @query   period, agentId
 */
router.get('/stats',
  resourceOwnershipMiddleware(),
  getLeadsStats
);

/**
 * @route   GET /api/leads/search/:query
 * @desc    Search leads by text
 * @access  Private (All authenticated users)
 * @param   query - Search query string
 * @query   limit
 */
router.get('/search/:query',
  resourceOwnershipMiddleware(),
  searchLeads
);

/**
 * @route   POST /api/leads
 * @desc    Create a new lead
 * @access  Private (Agents, Managers, Super Admin)
 * @body    Lead data according to createLeadSchema
 */
router.post('/',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(createLeadSchema),
  createLead
);

/**
 * @route   GET /api/leads/:id
 * @desc    Get lead by ID
 * @access  Private (All authenticated users)
 * @param   id - Lead ID
 */
router.get('/:id',
  resourceOwnershipMiddleware(),
  getLeadById
);

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead
 * @access  Private (Agents can update assigned leads, Managers/Super Admin can update all)
 * @param   id - Lead ID
 * @body    Lead update data according to updateLeadSchema
 */
router.put('/:id',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(updateLeadSchema),
  resourceOwnershipMiddleware(),
  updateLead
);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete lead
 * @access  Private (Managers, Super Admin only)
 * @param   id - Lead ID
 */
router.delete('/:id',
  roleMiddleware(['manager', 'super_admin']),
  resourceOwnershipMiddleware(),
  deleteLead
);

/**
 * @route   POST /api/leads/:id/followups
 * @desc    Add follow-up to lead
 * @access  Private (Agents can add to assigned leads, Managers/Super Admin can add to all)
 * @param   id - Lead ID
 * @body    Follow-up data according to followUpSchema
 */
router.post('/:id/followups',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(followUpSchema),
  resourceOwnershipMiddleware(),
  addFollowUp
);

/**
 * @route   POST /api/leads/:id/notes
 * @desc    Add note to lead
 * @access  Private (Agents can add to assigned leads, Managers/Super Admin can add to all)
 * @param   id - Lead ID
 * @body    Note data according to noteSchema
 */
router.post('/:id/notes',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(noteSchema),
  resourceOwnershipMiddleware(),
  addNote
);

/**
 * @route   PUT /api/leads/:id/assign
 * @desc    Assign lead to agent
 * @access  Private (Managers, Super Admin only)
 * @param   id - Lead ID
 * @body    Assignment data according to assignmentSchema
 */
router.put('/:id/assign',
  roleMiddleware(['manager', 'super_admin']),
  validationMiddleware(assignmentSchema),
  assignLead
);

/**
 * @route   POST /api/leads/:id/convert
 * @desc    Convert lead to client
 * @access  Private (Agents can convert assigned leads, Managers/Super Admin can convert all)
 * @param   id - Lead ID
 */
router.post('/:id/convert',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  resourceOwnershipMiddleware(),
  convertToClient
);

module.exports = router;
