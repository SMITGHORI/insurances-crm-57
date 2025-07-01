
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

// Form data endpoints
router.get('/form-data/policies', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  claimController.getPoliciesForClaim
);

router.get('/form-data/clients', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  claimController.getClientsForClaim
);

router.get('/form-data/policy/:policyId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('policyId', 'assignedAgentId'),
  claimController.getPolicyDetails
);

// Main CRUD operations
router.get('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.getAllClaims
);

router.get('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.getClaimById
);

router.post('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  validationMiddleware(claimValidation),
  claimController.createClaim
);

router.put('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  validationMiddleware(updateClaimValidation),
  claimController.updateClaim
);

router.delete('/:id', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.deleteClaim
);

// Document management
router.post('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  uploadMiddleware.single('document'),
  validationMiddleware(claimDocumentValidation),
  claimController.uploadDocument
);

router.get('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.getClaimDocuments
);

router.delete('/:id/documents/:documentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.deleteDocument
);

// Status and workflow management
router.put('/:id/status', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  validationMiddleware(claimStatusValidation),
  claimController.updateClaimStatus
);

router.post('/:id/notes', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  validationMiddleware(claimNoteValidation),
  claimController.addNote
);

router.get('/:id/notes', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  resourceOwnershipMiddleware('assignedTo', 'assignedTo'),
  claimController.getClaimNotes
);

// Search and reporting
router.get('/search/:query', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  claimController.searchClaims
);

router.get('/stats/summary', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.getClaimsStats
);

router.get('/stats/dashboard', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  claimController.getDashboardStats
);

router.get('/reports/aging', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.getClaimsAgingReport
);

router.get('/reports/settlement', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.getSettlementReport
);

// Bulk operations
router.post('/bulk/update', 
  roleMiddleware(['super_admin', 'manager']),
  validationMiddleware(bulkUpdateClaimsValidation),
  claimController.bulkUpdateClaims
);

router.post('/bulk/assign', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.bulkAssignClaims
);

// Export and import
router.get('/export', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.exportClaims
);

router.get('/templates/download', 
  roleMiddleware(['super_admin', 'manager']),
  claimController.downloadTemplate
);

router.post('/import', 
  roleMiddleware(['super_admin', 'manager']),
  uploadMiddleware.single('importFile'),
  claimController.importClaims
);

module.exports = router;
