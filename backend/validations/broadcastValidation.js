
const Joi = require('joi');

const validateBroadcast = Joi.object({
  title: Joi.string().max(200).required().messages({
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('offer', 'festival', 'announcement', 'promotion', 'newsletter', 'reminder').required(),
  channels: Joi.array().items(
    Joi.string().valid('email', 'whatsapp')
  ).min(1).required().messages({
    'array.min': 'At least one channel must be selected'
  }),
  subject: Joi.string().max(200).when('channels', {
    is: Joi.array().has('email'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  content: Joi.string().max(5000).required().messages({
    'string.max': 'Content cannot exceed 5000 characters',
    'any.required': 'Content is required'
  }),
  mediaUrl: Joi.string().uri().optional(),
  targetAudience: Joi.object({
    allClients: Joi.boolean().default(false),
    specificClients: Joi.array().items(Joi.string().hex().length(24)).optional(),
    clientTypes: Joi.array().items(Joi.string().valid('individual', 'corporate', 'group')).optional(),
    tierLevels: Joi.array().items(Joi.string().valid('bronze', 'silver', 'gold', 'platinum')).optional(),
    locations: Joi.array().items(
      Joi.object({
        city: Joi.string().optional(),
        state: Joi.string().optional()
      })
    ).optional()
  }).required(),
  scheduledAt: Joi.date().min('now').optional()
});

const validateOptInOut = Joi.object({
  channel: Joi.string().valid('email', 'whatsapp').required(),
  type: Joi.string().valid('offers', 'newsletters', 'reminders', 'all').required(),
  optIn: Joi.boolean().required()
});

module.exports = {
  validateBroadcast,
  validateOptInOut
};
