
const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware, resourceOwnershipMiddleware } = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/upload');
const { validationMiddleware } = require('../middleware/validation');
const { 
  claimValidation, 
  updateClaimValidation, 
  claimDocumentValidation,
  claimNoteValidation,
  claimStatusValidation,
  bulkUpdateClaimsValidation
} = require('../validations/claimValidation');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route GET /api/claims
 * @desc Get all claims with filtering, pagination, and search
 * @access Private (Super Admin: all claims, Manager: team claims, Agent: assigned claims)
 */
router.get('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.getAllClaims
);

/**
 * @route GET /api/claims/:id
 * @desc Get claim by ID
 * @access Private (Super Admin: any claim, Manager: team claims, Agent: assigned claims)
 */
router.get('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.getClaimById
);

/**
 * @route POST /api/claims
 * @desc Create new claim
 * @access Private (Super Admin, Manager, Agent)
 */
router.post('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  validationMiddleware(claimValidation),
  claimController.createClaim
);

/**
 * @route PUT /api/claims/:id
 * @desc Update claim
 * @access Private (Super Admin: any claim, Manager: team claims, Agent: assigned claims)
 */
router.put('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  validationMiddleware(updateClaimValidation),
  claimController.updateClaim
);

/**
 * @route DELETE /api/claims/:id
 * @desc Delete claim (soft delete)
 * @access Private (Super Admin, Manager)
 */
router.delete('/:id', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.deleteClaim
);

/**
 * @route POST /api/claims/:id/documents
 * @desc Upload claim document
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.post('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  uploadMiddleware.single('document'),
  validationMiddleware(claimDocumentValidation),
  claimController.uploadDocument
);

/**
 * @route GET /api/claims/:id/documents
 * @desc Get claim documents
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.get('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.getClaimDocuments
);

/**
 * @route DELETE /api/claims/:id/documents/:documentId
 * @desc Delete claim document
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.delete('/:id/documents/:documentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.deleteDocument
);

/**
 * @route PUT /api/claims/:id/status
 * @desc Update claim status
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.put('/:id/status', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  validationMiddleware(claimStatusValidation),
  claimController.updateClaimStatus
);

/**
 * @route POST /api/claims/:id/notes
 * @desc Add note to claim
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.post('/:id/notes', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  validationMiddleware(claimNoteValidation),
  claimController.addNote
);

/**
 * @route GET /api/claims/:id/notes
 * @desc Get claim notes
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.get('/:id/notes', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.getClaimNotes
);

/**
 * @route GET /api/claims/search/:query
 * @desc Search claims
 * @access Private (Super Admin, Manager, Agent)
 */
router.get('/search/:query', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  claimController.searchClaims
);

/**
 * @route GET /api/claims/stats/summary
 * @desc Get claims statistics summary
 * @access Private (Super Admin, Manager)
 */
router.get('/stats/summary', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.getClaimsStats
);

/**
 * @route GET /api/claims/stats/dashboard
 * @desc Get dashboard statistics for claims
 * @access Private (Super Admin, Manager, Agent)
 */
router.get('/stats/dashboard', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  claimController.getDashboardStats
);

/**
 * @route GET /api/claims/reports/aging
 * @desc Get claims aging report
 * @access Private (Super Admin, Manager)
 */
router.get('/reports/aging', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.getClaimsAgingReport
);

/**
 * @route GET /api/claims/reports/settlement
 * @desc Get settlement analysis report
 * @access Private (Super Admin, Manager)
 */
router.get('/reports/settlement', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.getSettlementReport
);

/**
 * @route POST /api/claims/bulk/update
 * @desc Bulk update claims
 * @access Private (Super Admin, Manager)
 */
router.post('/bulk/update', 
  roleMiddleware(['super_admin', 'manager']),
  validationMiddleware(bulkUpdateClaimsValidation),
  claimController.bulkUpdateClaims
);

/**
 * @route POST /api/claims/bulk/assign
 * @desc Bulk assign claims to agents
 * @access Private (Super Admin, Manager)
 */
router.post('/bulk/assign', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.bulkAssignClaims
);

/**
 * @route GET /api/claims/export
 * @desc Export claims data
 * @access Private (Super Admin, Manager)
 */
router.get('/export', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.exportClaims
);

/**
 * @route GET /api/claims/templates/download
 * @desc Download claim import template
 * @access Private (Super Admin, Manager)
 */
router.get('/templates/download', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.downloadTemplate
);

/**
 * @route POST /api/claims/import
 * @desc Import claims from file
 * @access Private (Super Admin, Manager)
 */
router.post('/import', 
  roleMiddleware(['super_admin', 'manager']),
  uploadMiddleware.single('importFile'),
  claimController.importClaims
);

module.exports = router;
