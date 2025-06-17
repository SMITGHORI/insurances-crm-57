const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware, clientAccessMiddleware } = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/upload');
const validationMiddleware = require('../middleware/validation');
const { clientValidation, updateClientValidation, documentValidation } = require('../validations/clientValidation');
const { clientExportValidation } = require('../validations/exportValidation');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route GET /api/clients
 * @desc Get all clients with filtering, pagination, and search
 * @access Private (Super Admin: all clients, Agent: assigned clients only)
 */
router.get('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientAccessMiddleware,
  clientController.getAllClients
);

/**
 * @route POST /api/clients/export
 * @desc Export clients data
 * @access Private (All roles with role-based filtering)
 */
router.post('/export',
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientAccessMiddleware,
  validationMiddleware(clientExportValidation),
  clientController.exportClients
);

/**
 * @route GET /api/clients/:id
 * @desc Get client by ID
 * @access Private (Super Admin: any client, Agent: assigned clients only)
 */
router.get('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientAccessMiddleware,
  clientController.getClientById
);

/**
 * @route POST /api/clients
 * @desc Create new client
 * @access Private (Super Admin, Manager, Agent - but agents can only assign to themselves)
 */
router.post('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  validationMiddleware(clientValidation),
  clientController.createClient
);

/**
 * @route PUT /api/clients/:id
 * @desc Update client (Limited access for agents)
 * @access Private (Super Admin: any client, Agent: assigned clients only, limited fields)
 */
router.put('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientAccessMiddleware,
  validationMiddleware(updateClientValidation),
  clientController.updateClient
);

/**
 * @route DELETE /api/clients/:id
 * @desc Delete client
 * @access Private (Super Admin and Manager only)
 */
router.delete('/:id', 
  roleMiddleware(['super_admin', 'manager']),
  clientController.deleteClient
);

/**
 * @route POST /api/clients/:id/documents
 * @desc Upload client document
 * @access Private (All roles can upload documents for assigned clients)
 */
router.post('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientAccessMiddleware,
  uploadMiddleware.single('document'),
  validationMiddleware(documentValidation),
  clientController.uploadDocument
);

/**
 * @route GET /api/clients/:id/documents
 * @desc Get client documents
 * @access Private (All roles can view documents for assigned clients)
 */
router.get('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientAccessMiddleware,
  clientController.getClientDocuments
);

/**
 * @route DELETE /api/clients/:id/documents/:documentId
 * @desc Delete client document
 * @access Private (Super Admin, Manager, Agent for assigned clients)
 */
router.delete('/:id/documents/:documentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientAccessMiddleware,
  clientController.deleteDocument
);

/**
 * @route GET /api/clients/search/:query
 * @desc Search clients
 * @access Private (Role-based filtered results)
 */
router.get('/search/:query', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientAccessMiddleware,
  clientController.searchClients
);

/**
 * @route GET /api/clients/agent/:agentId
 * @desc Get clients assigned to specific agent
 * @access Private (Super Admin, Manager can view any agent, Agent can only view own)
 */
router.get('/agent/:agentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientController.getClientsByAgent
);

/**
 * @route PUT /api/clients/:id/assign
 * @desc Assign client to agent
 * @access Private (Super Admin, Manager only)
 */
router.put('/:id/assign', 
  roleMiddleware(['super_admin', 'manager']),
  clientController.assignClientToAgent
);

/**
 * @route GET /api/clients/stats/summary
 * @desc Get client statistics summary
 * @access Private (Role-based filtered stats)
 */
router.get('/stats/summary', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientController.getClientStats
);

module.exports = router;
