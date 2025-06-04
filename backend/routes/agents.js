
const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware, resourceOwnershipMiddleware } = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/upload');
const { validationMiddleware } = require('../middleware/validation');
const { 
  agentValidation, 
  updateAgentValidation, 
  agentDocumentValidation,
  agentNoteValidation,
  performanceTargetsValidation
} = require('../validations/agentValidation');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route GET /api/agents
 * @desc Get all agents with filtering, pagination, and search
 * @access Private (Super Admin: all agents, Manager: team agents, Agent: own profile)
 */
router.get('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.getAllAgents
);

/**
 * @route GET /api/agents/:id
 * @desc Get agent by ID
 * @access Private (Super Admin: any agent, Manager: team agents, Agent: own profile)
 */
router.get('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.getAgentById
);

/**
 * @route POST /api/agents
 * @desc Create new agent
 * @access Private (Super Admin, Manager)
 */
router.post('/', 
  roleMiddleware(['super_admin', 'manager']),
  validationMiddleware(agentValidation),
  agentController.createAgent
);

/**
 * @route PUT /api/agents/:id
 * @desc Update agent
 * @access Private (Super Admin: any agent, Manager: team agents, Agent: own profile)
 */
router.put('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  validationMiddleware(updateAgentValidation),
  agentController.updateAgent
);

/**
 * @route DELETE /api/agents/:id
 * @desc Delete agent (soft delete)
 * @access Private (Super Admin only)
 */
router.delete('/:id', 
  roleMiddleware(['super_admin']),
  agentController.deleteAgent
);

/**
 * @route POST /api/agents/:id/documents
 * @desc Upload agent document
 * @access Private (Super Admin, Manager, own Agent)
 */
router.post('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  uploadMiddleware.single('document'),
  validationMiddleware(agentDocumentValidation),
  agentController.uploadDocument
);

/**
 * @route GET /api/agents/:id/documents
 * @desc Get agent documents
 * @access Private (Super Admin, Manager, own Agent)
 */
router.get('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.getAgentDocuments
);

/**
 * @route DELETE /api/agents/:id/documents/:documentId
 * @desc Delete agent document
 * @access Private (Super Admin, Manager, own Agent)
 */
router.delete('/:id/documents/:documentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.deleteDocument
);

/**
 * @route GET /api/agents/:id/clients
 * @desc Get clients assigned to agent
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.get('/:id/clients', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.getAgentClients
);

/**
 * @route GET /api/agents/:id/policies
 * @desc Get policies assigned to agent
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.get('/:id/policies', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.getAgentPolicies
);

/**
 * @route GET /api/agents/:id/commissions
 * @desc Get agent commission details
 * @access Private (Super Admin, Manager, own Agent)
 */
router.get('/:id/commissions', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.getAgentCommissions
);

/**
 * @route GET /api/agents/:id/performance
 * @desc Get agent performance data
 * @access Private (Super Admin, Manager, own Agent)
 */
router.get('/:id/performance', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.getAgentPerformance
);

/**
 * @route PUT /api/agents/:id/targets
 * @desc Update agent performance targets
 * @access Private (Super Admin, Manager)
 */
router.put('/:id/targets', 
  roleMiddleware(['super_admin', 'manager']),
  validationMiddleware(performanceTargetsValidation),
  agentController.updatePerformanceTargets
);

/**
 * @route POST /api/agents/:id/notes
 * @desc Add note to agent
 * @access Private (Super Admin, Manager, own Agent)
 */
router.post('/:id/notes', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  validationMiddleware(agentNoteValidation),
  agentController.addNote
);

/**
 * @route GET /api/agents/:id/notes
 * @desc Get agent notes
 * @access Private (Super Admin, Manager, own Agent)
 */
router.get('/:id/notes', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', '_id'),
  agentController.getAgentNotes
);

/**
 * @route GET /api/agents/search/:query
 * @desc Search agents
 * @access Private (Super Admin, Manager)
 */
router.get('/search/:query', 
  roleMiddleware(['super_admin', 'manager']),
  agentController.searchAgents
);

/**
 * @route GET /api/agents/stats/summary
 * @desc Get agent statistics summary
 * @access Private (Super Admin, Manager)
 */
router.get('/stats/summary', 
  roleMiddleware(['super_admin', 'manager']),
  agentController.getAgentStats
);

/**
 * @route GET /api/agents/performance/rankings
 * @desc Get agent performance rankings
 * @access Private (Super Admin, Manager)
 */
router.get('/performance/rankings', 
  roleMiddleware(['super_admin', 'manager']),
  agentController.getPerformanceRankings
);

/**
 * @route GET /api/agents/licenses/expiring
 * @desc Get agents with expiring licenses
 * @access Private (Super Admin, Manager)
 */
router.get('/licenses/expiring', 
  roleMiddleware(['super_admin', 'manager']),
  agentController.getExpiringLicenses
);

/**
 * @route POST /api/agents/bulk/update
 * @desc Bulk update agents
 * @access Private (Super Admin only)
 */
router.post('/bulk/update', 
  roleMiddleware(['super_admin']),
  agentController.bulkUpdateAgents
);

/**
 * @route GET /api/agents/export
 * @desc Export agents data
 * @access Private (Super Admin, Manager)
 */
router.get('/export', 
  roleMiddleware(['super_admin', 'manager']),
  agentController.exportAgents
);

module.exports = router;
