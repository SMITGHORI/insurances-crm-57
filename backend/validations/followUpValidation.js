
const Joi = require('joi');

const followUpValidation = Joi.object({
  clientId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Client ID must be a valid ObjectId',
    'string.length': 'Client ID must be exactly 24 characters',
    'any.required': 'Client ID is required'
  }),
  policyId: Joi.string().hex().length(24).optional(),
  interactionId: Joi.string().hex().length(24).optional(),
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(1000).optional(),
  type: Joi.string().valid('call', 'email', 'meeting', 'quote_follow_up', 'renewal_reminder', 'claim_check', 'policy_review', 'other').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  scheduledDate: Joi.date().min('now').required(),
  scheduledTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Scheduled time must be in HH:MM format (24-hour)'
  }),
  duration: Joi.number().min(15).max(480).default(30),
  tags: Joi.array().items(Joi.string().trim().max(50)).optional()
});

const updateFollowUpValidation = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
  type: Joi.string().valid('call', 'email', 'meeting', 'quote_follow_up', 'renewal_reminder', 'claim_check', 'policy_review', 'other').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  scheduledDate: Joi.date().min('now').optional(),
  scheduledTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: Joi.number().min(15).max(480).optional(),
  status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show').optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).optional()
});

const completeFollowUpValidation = Joi.object({
  outcome: Joi.string().valid('successful', 'reschedule_needed', 'not_interested', 'follow_up_needed', 'converted').required(),
  completionNotes: Joi.string().trim().max(1000).required(),
  nextFollowUpDate: Joi.date().min('now').optional()
});

module.exports = {
  followUpValidation,
  updateFollowUpValidation,
  completeFollowUpValidation
};
