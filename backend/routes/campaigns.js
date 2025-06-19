
const express = require('express');
const router = express.Router();

// Import middleware
const authMiddleware = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { validationMiddleware } = require('../middleware/validation');

// Import validation schemas
const {
  emailCampaignSchema,
  whatsAppTemplateSchema,
  leadQualificationSchema
} = require('../validations/campaignValidation');

// Import controllers
const {
  getEmailCampaigns,
  createEmailCampaign,
  updateEmailCampaign,
  deleteEmailCampaign,
  sendEmailCampaign,
  getWhatsAppTemplates,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate,
  getLeadQualificationCriteria,
  createLeadQualificationCriteria,
  updateLeadQualificationCriteria,
  deleteLeadQualificationCriteria,
  getCampaignStats
} = require('../controllers/campaignController');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Email Campaign Routes
router.get('/email', roleMiddleware(['agent', 'manager', 'super_admin']), getEmailCampaigns);
router.post('/email', roleMiddleware(['manager', 'super_admin']), validationMiddleware(emailCampaignSchema), createEmailCampaign);
router.put('/email/:id', roleMiddleware(['manager', 'super_admin']), validationMiddleware(emailCampaignSchema), updateEmailCampaign);
router.delete('/email/:id', roleMiddleware(['super_admin']), deleteEmailCampaign);
router.post('/email/:id/send', roleMiddleware(['manager', 'super_admin']), sendEmailCampaign);

// WhatsApp Template Routes
router.get('/whatsapp', roleMiddleware(['agent', 'manager', 'super_admin']), getWhatsAppTemplates);
router.post('/whatsapp', roleMiddleware(['manager', 'super_admin']), validationMiddleware(whatsAppTemplateSchema), createWhatsAppTemplate);
router.put('/whatsapp/:id', roleMiddleware(['manager', 'super_admin']), validationMiddleware(whatsAppTemplateSchema), updateWhatsAppTemplate);
router.delete('/whatsapp/:id', roleMiddleware(['super_admin']), deleteWhatsAppTemplate);

// Lead Qualification Routes
router.get('/qualification', roleMiddleware(['manager', 'super_admin']), getLeadQualificationCriteria);
router.post('/qualification', roleMiddleware(['super_admin']), validationMiddleware(leadQualificationSchema), createLeadQualificationCriteria);
router.put('/qualification/:id', roleMiddleware(['super_admin']), validationMiddleware(leadQualificationSchema), updateLeadQualificationCriteria);
router.delete('/qualification/:id', roleMiddleware(['super_admin']), deleteLeadQualificationCriteria);

// Campaign Statistics
router.get('/stats', roleMiddleware(['manager', 'super_admin']), getCampaignStats);

module.exports = router;
