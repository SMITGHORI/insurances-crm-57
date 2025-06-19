
const Joi = require('joi');

const emailCampaignSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  subject: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(10).max(5000).required(),
  targetSegment: Joi.string().valid('All', 'New', 'In Progress', 'Qualified', 'High Priority', 'Stale').default('All'),
  isActive: Joi.boolean().default(true)
});

const whatsAppTemplateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  message: Joi.string().min(10).max(1000).required(),
  variables: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    description: Joi.string()
  })).default([]),
  isActive: Joi.boolean().default(true)
});

const leadQualificationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  criteria: Joi.object({
    minBudget: Joi.number().min(0).default(0),
    requiredFields: Joi.array().items(Joi.string()).default([]),
    timeframe: Joi.string().valid('Immediate', 'Within 1 month', 'Within 3 months', 'Within 6 months', 'Later'),
    sources: Joi.array().items(Joi.string()).default([]),
    products: Joi.array().items(Joi.string()).default([])
  }).required(),
  scoreThreshold: Joi.number().min(0).max(100).default(50),
  isActive: Joi.boolean().default(true)
});

module.exports = {
  emailCampaignSchema,
  whatsAppTemplateSchema,
  leadQualificationSchema
};
