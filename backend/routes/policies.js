
const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware, resourceOwnershipMiddleware } = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/upload');
const { validationMiddleware } = require('../middleware/validation');
const { 
  policyValidation, 
  updatePolicyValidation, 
  policyDocumentValidation,
  paymentValidation,
  renewalValidation
} = require('../validations/policyValidation');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route GET /api/policies
 * @desc Get all policies with filtering, pagination, and search
 * @access Private (Super Admin: all policies, Agent: assigned policies only)
 */
router.get('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  policyController.getAllPolicies
);

/**
 * @route GET /api/policies/:id
 * @desc Get policy by ID
 * @access Private (Super Admin: any policy, Agent: assigned policies only)
 */
router.get('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  policyController.getPolicyById
);

/**
 * @route POST /api/policies
 * @desc Create new policy
 * @access Private (Super Admin, Manager)
 */
router.post('/', 
  roleMiddleware(['super_admin', 'manager']),
  validationMiddleware(policyValidation),
  policyController.createPolicy
);

/**
 * @route PUT /api/policies/:id
 * @desc Update policy
 * @access Private (Super Admin: any policy, Agent: assigned policies only)
 */
router.put('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  validationMiddleware(updatePolicyValidation),
  policyController.updatePolicy
);

/**
 * @route DELETE /api/policies/:id
 * @desc Delete policy (soft delete)
 * @access Private (Super Admin only)
 */
router.delete('/:id', 
  roleMiddleware(['super_admin']),
  policyController.deletePolicy
);

/**
 * @route POST /api/policies/:id/documents
 * @desc Upload policy document
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.post('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  uploadMiddleware.single('document'),
  validationMiddleware(policyDocumentValidation),
  policyController.uploadDocument
);

/**
 * @route GET /api/policies/:id/documents
 * @desc Get policy documents
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.get('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  policyController.getPolicyDocuments
);

/**
 * @route DELETE /api/policies/:id/documents/:documentId
 * @desc Delete policy document
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.delete('/:id/documents/:documentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  policyController.deleteDocument
);

/**
 * @route POST /api/policies/:id/payments
 * @desc Add payment record
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.post('/:id/payments', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  validationMiddleware(paymentValidation),
  policyController.addPayment
);

/**
 * @route GET /api/policies/:id/payments
 * @desc Get policy payment history
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.get('/:id/payments', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  policyController.getPaymentHistory
);

/**
 * @route POST /api/policies/:id/renew
 * @desc Renew policy
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.post('/:id/renew', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  validationMiddleware(renewalValidation),
  policyController.renewPolicy
);

/**
 * @route POST /api/policies/:id/notes
 * @desc Add note to policy
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.post('/:id/notes', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  policyController.addNote
);

/**
 * @route GET /api/policies/:id/notes
 * @desc Get policy notes
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.get('/:id/notes', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('id', 'assignedAgentId'),
  policyController.getPolicyNotes
);

/**
 * @route GET /api/policies/search/:query
 * @desc Search policies
 * @access Private (Super Admin: all policies, Agent: assigned policies only)
 */
router.get('/search/:query', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  policyController.searchPolicies
);

/**
 * @route GET /api/policies/agent/:agentId
 * @desc Get policies assigned to specific agent
 * @access Private (Super Admin, Manager, specific Agent)
 */
router.get('/agent/:agentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  policyController.getPoliciesByAgent
);

/**
 * @route PUT /api/policies/:id/assign
 * @desc Assign policy to agent
 * @access Private (Super Admin, Manager)
 */
router.put('/:id/assign', 
  roleMiddleware(['super_admin', 'manager']),
  policyController.assignPolicyToAgent
);

/**
 * @route GET /api/policies/stats/summary
 * @desc Get policy statistics summary
 * @access Private (Super Admin, Manager)
 */
router.get('/stats/summary', 
  roleMiddleware(['super_admin', 'manager']),
  policyController.getPolicyStats
);

/**
 * @route GET /api/policies/expiring/:days
 * @desc Get policies expiring within specified days
 * @access Private (Super Admin, Manager, Agent)
 */
router.get('/expiring/:days', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  policyController.getExpiringPolicies
);

/**
 * @route GET /api/policies/renewals/due
 * @desc Get policies due for renewal
 * @access Private (Super Admin, Manager, Agent)
 */
router.get('/renewals/due', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  policyController.getPoliciesDueForRenewal
);

/**
 * @route POST /api/policies/bulk/assign
 * @desc Bulk assign policies to agents
 * @access Private (Super Admin, Manager)
 */
router.post('/bulk/assign', 
  roleMiddleware(['super_admin', 'manager']),
  policyController.bulkAssignPolicies
);

/**
 * @route GET /api/policies/export
 * @desc Export policies data
 * @access Private (Super Admin, Manager)
 */
router.get('/export', 
  roleMiddleware(['super_admin', 'manager']),
  policyController.exportPolicies
);

module.exports = router;
