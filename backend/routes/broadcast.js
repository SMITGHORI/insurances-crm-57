
const express = require('express');
const broadcastController = require('../controllers/broadcastController');
const { validateBroadcast, validateOptInOut } = require('../validations/broadcastValidation');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Broadcast routes
router.get('/', broadcastController.getBroadcasts);
router.post('/', authorize(['admin', 'manager', 'agent']), validate(validateBroadcast), broadcastController.createBroadcast);
router.post('/eligible-clients', broadcastController.getEligibleClients);
router.get('/:broadcastId/stats', broadcastController.getBroadcastStats);

// Client preferences routes
router.put('/clients/:clientId/preferences', validate(validateOptInOut), broadcastController.updateClientPreferences);

module.exports = router;
