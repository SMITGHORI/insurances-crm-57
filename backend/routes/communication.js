
const express = require('express');
const communicationController = require('../controllers/communicationController');
const { validateCommunication, validateLoyaltyPoints, validateOffer, validateAutomationRule } = require('../validations/communicationValidation');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Communication routes
router.get('/', communicationController.getCommunications);
router.post('/', validationMiddleware(validateCommunication), communicationController.sendCommunication);
router.get('/stats', communicationController.getStats);

// Loyalty Points routes
router.get('/loyalty/:clientId', communicationController.getLoyaltyPoints);
router.post('/loyalty/:clientId', validationMiddleware(validateLoyaltyPoints), communicationController.updateLoyaltyPoints);

// Offers routes
router.get('/offers', communicationController.getOffers);
router.post('/offers', roleMiddleware(['admin', 'manager']), validationMiddleware(validateOffer), communicationController.createOffer);

// Automation rules routes
router.get('/automation', roleMiddleware(['admin', 'manager']), communicationController.getAutomationRules);
router.post('/automation', roleMiddleware(['admin', 'manager']), validationMiddleware(validateAutomationRule), communicationController.createAutomationRule);

module.exports = router;
