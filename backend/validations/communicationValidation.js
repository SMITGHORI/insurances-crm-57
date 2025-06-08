
const Joi = require('joi');

const validateCommunication = Joi.object({
  clientId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Client ID must be a valid ObjectId',
    'string.length': 'Client ID must be exactly 24 characters',
    'any.required': 'Client ID is required'
  }),
  policyId: Joi.string().hex().length(24).optional(),
  type: Joi.string().valid('birthday', 'anniversary', 'offer', 'points', 'eligibility', 'renewal_reminder', 'custom').required(),
  channel: Joi.string().valid('email', 'whatsapp', 'sms').required(),
  subject: Joi.string().max(200).when('channel', {
    is: 'email',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  content: Joi.string().max(2000).required(),
  scheduledFor: Joi.date().min('now').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium')
});

const validateLoyaltyPoints = Joi.object({
  points: Joi.number().integer().min(1).required(),
  reason: Joi.string().max(200).required(),
  transactionType: Joi.string().valid('earned', 'redeemed', 'expired', 'adjusted').required(),
  policyId: Joi.string().hex().length(24).optional()
});

const validateOffer = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(1000).required(),
  type: Joi.string().valid('discount', 'cashback', 'bonus_points', 'free_addon', 'premium_waiver', 'special_rate').required(),
  applicableProducts: Joi.array().items(
    Joi.string().valid('life', 'health', 'auto', 'home', 'business', 'travel', 'disability')
  ).min(1).required(),
  discountPercentage: Joi.number().min(0).max(100).when('type', {
    is: 'discount',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  discountAmount: Joi.number().min(0).optional(),
  eligibilityCriteria: Joi.object({
    minAge: Joi.number().min(0).max(120).optional(),
    maxAge: Joi.number().min(0).max(120).optional(),
    clientTypes: Joi.array().items(Joi.string().valid('individual', 'corporate', 'group')).optional(),
    existingPolicyRequired: Joi.boolean().optional(),
    minPremium: Joi.number().min(0).optional(),
    tierLevels: Joi.array().items(Joi.string().valid('bronze', 'silver', 'gold', 'platinum')).optional()
  }).optional(),
  validFrom: Joi.date().required(),
  validUntil: Joi.date().greater(Joi.ref('validFrom')).required(),
  maxUsageCount: Joi.number().integer().min(-1).default(-1),
  targetAudience: Joi.object({
    allClients: Joi.boolean().default(false),
    specificClients: Joi.array().items(Joi.string().hex().length(24)).optional(),
    birthdayClients: Joi.boolean().optional(),
    anniversaryClients: Joi.boolean().optional(),
    tierBasedClients: Joi.array().items(Joi.string().valid('bronze', 'silver', 'gold', 'platinum')).optional()
  }).required()
});

const validateAutomationRule = Joi.object({
  name: Joi.string().max(100).required(),
  type: Joi.string().valid('birthday', 'anniversary', 'offer_notification', 'points_update', 'renewal_reminder', 'welcome', 'policy_expiry').required(),
  trigger: Joi.object({
    event: Joi.string().valid('date_based', 'policy_created', 'policy_renewed', 'points_earned', 'tier_upgraded', 'manual').required(),
    daysOffset: Joi.number().integer().optional(),
    timeOfDay: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
  }).required(),
  conditions: Joi.object({
    clientTypes: Joi.array().items(Joi.string().valid('individual', 'corporate', 'group')).optional(),
    policyTypes: Joi.array().items(Joi.string().valid('life', 'health', 'auto', 'home', 'business', 'travel', 'disability')).optional(),
    minPremium: Joi.number().min(0).optional(),
    tierLevels: Joi.array().items(Joi.string().valid('bronze', 'silver', 'gold', 'platinum')).optional(),
    agentIds: Joi.array().items(Joi.string().hex().length(24)).optional()
  }).optional(),
  action: Joi.object({
    channel: Joi.string().valid('email', 'whatsapp', 'sms', 'both').required(),
    templateId: Joi.string().hex().length(24).optional(),
    delayMinutes: Joi.number().integer().min(0).default(0)
  }).required()
});

module.exports = {
  validateCommunication,
  validateLoyaltyPoints,
  validateOffer,
  validateAutomationRule
};
