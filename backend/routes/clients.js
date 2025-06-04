
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/upload');
const validationMiddleware = require('../middleware/validation');
const { clientValidation, updateClientValidation, documentValidation } = require('../validations/clientValidation');

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route GET /api/clients
 * @desc Get all clients with filtering, pagination, and search
 * @access Private (Super Admin: all clients, Agent: assigned clients only)
 */
router.get('/', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientController.getAllClients
);

/**
 * @route GET /api/clients/:id
 * @desc Get client by ID
 * @access Private (Super Admin: any client, Agent: assigned clients only)
 */
router.get('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientController.getClientById
);

/**
 * @route POST /api/clients
 * @desc Create new client
 * @access Private (Super Admin, Manager)
 */
router.post('/', 
  roleMiddleware(['super_admin', 'manager']),
  validationMiddleware(clientValidation),
  clientController.createClient
);

/**
 * @route PUT /api/clients/:id
 * @desc Update client
 * @access Private (Super Admin: any client, Agent: assigned clients only)
 */
router.put('/:id', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  validationMiddleware(updateClientValidation),
  clientController.updateClient
);

/**
 * @route DELETE /api/clients/:id
 * @desc Delete client
 * @access Private (Super Admin only)
 */
router.delete('/:id', 
  roleMiddleware(['super_admin']),
  clientController.deleteClient
);

/**
 * @route POST /api/clients/:id/documents
 * @desc Upload client document
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.post('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  uploadMiddleware.single('document'),
  validationMiddleware(documentValidation),
  clientController.uploadDocument
);

/**
 * @route GET /api/clients/:id/documents
 * @desc Get client documents
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.get('/:id/documents', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientController.getClientDocuments
);

/**
 * @route DELETE /api/clients/:id/documents/:documentId
 * @desc Delete client document
 * @access Private (Super Admin, Manager, assigned Agent)
 */
router.delete('/:id/documents/:documentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientController.deleteDocument
);

/**
 * @route GET /api/clients/search/:query
 * @desc Search clients
 * @access Private (Super Admin: all clients, Agent: assigned clients only)
 */
router.get('/search/:query', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientController.searchClients
);

/**
 * @route GET /api/clients/agent/:agentId
 * @desc Get clients assigned to specific agent
 * @access Private (Super Admin, Manager, specific Agent)
 */
router.get('/agent/:agentId', 
  roleMiddleware(['super_admin', 'manager', 'agent']),
  clientController.getClientsByAgent
);

/**
 * @route PUT /api/clients/:id/assign
 * @desc Assign client to agent
 * @access Private (Super Admin, Manager)
 */
router.put('/:id/assign', 
  roleMiddleware(['super_admin', 'manager']),
  clientController.assignClientToAgent
);

/**
 * @route GET /api/clients/stats/summary
 * @desc Get client statistics summary
 * @access Private (Super Admin, Manager)
 */
router.get('/stats/summary', 
  roleMiddleware(['super_admin', 'manager']),
  clientController.getClientStats
);

module.exports = router;
