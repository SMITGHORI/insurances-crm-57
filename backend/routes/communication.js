
const express = require('express');
const communicationController = require('../controllers/communicationController');
const { validateCommunication, validateLoyaltyPoints, validateOffer, validateAutomationRule } = require('../validations/communicationValidation');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Communication routes
router.get('/', communicationController.getCommunications);
router.post('/', validate(validateCommunication), communicationController.sendCommunication);
router.get('/stats', communicationController.getStats);

// Loyalty Points routes
router.get('/loyalty/:clientId', communicationController.getLoyaltyPoints);
router.post('/loyalty/:clientId', validate(validateLoyaltyPoints), communicationController.updateLoyaltyPoints);

// Offers routes
router.get('/offers', communicationController.getOffers);
router.post('/offers', authorize(['admin', 'manager']), validate(validateOffer), communicationController.createOffer);

// Automation rules routes
router.get('/automation', authorize(['admin', 'manager']), communicationController.getAutomationRules);
router.post('/automation', authorize(['admin', 'manager']), validate(validateAutomationRule), communicationController.createAutomationRule);

module.exports = router;
