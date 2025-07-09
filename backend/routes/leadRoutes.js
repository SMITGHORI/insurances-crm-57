
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
  searchLeads,
  getStaleLeads,
  getLeadFunnelReport
} = require('../controllers/leadController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET routes
router.get('/',
  validationMiddleware(queryParamsSchema, 'query'),
  resourceOwnershipMiddleware(),
  getLeads
);

router.get('/stats',
  resourceOwnershipMiddleware(),
  getLeadsStats
);

router.get('/search/:query',
  resourceOwnershipMiddleware(),
  searchLeads
);

router.get('/stale',
  resourceOwnershipMiddleware(),
  getStaleLeads
);

router.get('/funnel-report',
  roleMiddleware(['manager', 'super_admin']),
  resourceOwnershipMiddleware(),
  getLeadFunnelReport
);

router.get('/:id',
  resourceOwnershipMiddleware(),
  getLeadById
);

// POST routes
router.post('/',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(createLeadSchema),
  createLead
);

router.post('/:id/followups',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(followUpSchema),
  resourceOwnershipMiddleware(),
  addFollowUp
);

router.post('/:id/notes',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(noteSchema),
  resourceOwnershipMiddleware(),
  addNote
);

router.post('/:id/convert',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  resourceOwnershipMiddleware(),
  convertToClient
);

// PUT routes
router.put('/:id',
  roleMiddleware(['agent', 'manager', 'super_admin']),
  validationMiddleware(updateLeadSchema),
  resourceOwnershipMiddleware(),
  updateLead
);

router.put('/:id/assign',
  roleMiddleware(['manager', 'super_admin']),
  validationMiddleware(assignmentSchema),
  assignLead
);

// DELETE routes
router.delete('/:id',
  roleMiddleware(['manager', 'super_admin']),
  resourceOwnershipMiddleware(),
  deleteLead
);

module.exports = router;
