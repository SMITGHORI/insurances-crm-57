
const Joi = require('joi');

const interactionValidation = Joi.object({
  clientId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Client ID must be a valid ObjectId',
    'string.length': 'Client ID must be exactly 24 characters',
    'any.required': 'Client ID is required'
  }),
  policyId: Joi.string().hex().length(24).optional(),
  type: Joi.string().valid('call', 'email', 'meeting', 'whatsapp', 'sms', 'visit', 'other').required(),
  subject: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(2000).required(),
  outcome: Joi.string().valid('positive', 'neutral', 'negative', 'follow_up_needed', 'no_response').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  duration: Joi.number().min(0).optional(),
  interactionDate: Joi.date().max('now').required(),
  notes: Joi.string().trim().max(1000).optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
  followUpRequired: Joi.boolean().default(false),
  followUpDate: Joi.date().min('now').when('followUpRequired', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  followUpNotes: Joi.string().trim().max(500).optional()
});

const updateInteractionValidation = Joi.object({
  type: Joi.string().valid('call', 'email', 'meeting', 'whatsapp', 'sms', 'visit', 'other').optional(),
  subject: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(2000).optional(),
  outcome: Joi.string().valid('positive', 'neutral', 'negative', 'follow_up_needed', 'no_response').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  duration: Joi.number().min(0).optional(),
  interactionDate: Joi.date().max('now').optional(),
  notes: Joi.string().trim().max(1000).optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
  followUpRequired: Joi.boolean().optional(),
  followUpDate: Joi.date().min('now').optional(),
  followUpNotes: Joi.string().trim().max(500).optional(),
  status: Joi.string().valid('completed', 'follow_up_scheduled', 'closed').optional()
});

const attachmentValidation = Joi.object({
  // File validation is handled by multer middleware
}).unknown(true);

module.exports = {
  interactionValidation,
  updateInteractionValidation,
  attachmentValidation
};
