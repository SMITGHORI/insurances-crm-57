
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const uploadMiddleware = require('../middleware/upload');
const { validationMiddleware } = require('../middleware/validation');
const { clientValidation, updateClientValidation } = require('../validations/clientValidation');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/clients - Get all clients with pagination and filtering
router.get('/', clientController.getAllClients);

// GET /api/clients/:id - Get client by ID
router.get('/:id', clientController.getClientById);

// POST /api/clients - Create new client
router.post('/', 
  validationMiddleware(clientValidation),
  clientController.createClient
);

// PUT /api/clients/:id - Update client
router.put('/:id', 
  validationMiddleware(updateClientValidation),
  clientController.updateClient
);

// DELETE /api/clients/:id - Delete client
router.delete('/:id', clientController.deleteClient);

// GET /api/clients/search - Search clients
router.get('/search', clientController.searchClients);

// Document upload routes
router.post('/:id/documents', 
  uploadMiddleware.single('document'),
  clientController.uploadDocument
);

router.get('/:id/documents', clientController.getClientDocuments);

router.delete('/:id/documents/:documentId', clientController.deleteDocument);

module.exports = router;
