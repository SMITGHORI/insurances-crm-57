
const express = require('express');
const broadcastController = require('../controllers/broadcastController');
const { validateBroadcast, validateOptInOut } = require('../validations/broadcastValidation');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Broadcast routes
router.get('/', broadcastController.getBroadcasts);
router.post('/', roleMiddleware(['admin', 'manager', 'agent']), validationMiddleware(validateBroadcast), broadcastController.createBroadcast);
router.post('/eligible-clients', broadcastController.getEligibleClients);
router.get('/:broadcastId/stats', broadcastController.getBroadcastStats);

// Client preferences routes
router.put('/clients/:clientId/preferences', validationMiddleware(validateOptInOut), broadcastController.updateClientPreferences);

module.exports = router;
