
const express = require('express');
const router = express.Router();
const enhancedBroadcastController = require('../controllers/enhancedBroadcastController');
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');
const { validateEnhancedBroadcast, validateBroadcastTemplate, validateApproval } = require('../validations/enhancedBroadcastValidation');

// Apply authentication to all routes
router.use(authMiddleware);

// Broadcast Management Routes
router.get('/', roleMiddleware(['agent', 'manager', 'super_admin']), enhancedBroadcastController.getBroadcasts);
router.post('/', roleMiddleware(['manager', 'super_admin']), validationMiddleware(validateEnhancedBroadcast), enhancedBroadcastController.createBroadcast);
router.get('/:broadcastId/analytics', roleMiddleware(['agent', 'manager', 'super_admin']), enhancedBroadcastController.getBroadcastAnalytics);

// Approval Workflow Routes
router.post('/:broadcastId/approval', roleMiddleware(['manager', 'super_admin']), validationMiddleware(validateApproval), enhancedBroadcastController.approveBroadcast);

// A/B Testing Routes
router.post('/:broadcastId/ab-test', roleMiddleware(['manager', 'super_admin']), enhancedBroadcastController.manageAbTest);

// Template Management Routes
router.get('/templates', roleMiddleware(['agent', 'manager', 'super_admin']), enhancedBroadcastController.getTemplates);
router.post('/templates', roleMiddleware(['manager', 'super_admin']), validationMiddleware(validateBroadcastTemplate), enhancedBroadcastController.createTemplate);

// Automation Trigger Routes
router.post('/triggers/:triggerType', roleMiddleware(['manager', 'super_admin']), enhancedBroadcastController.processAutomatedTriggers);

module.exports = router;
