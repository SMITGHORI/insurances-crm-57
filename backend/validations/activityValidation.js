
const Joi = require('joi');

// Create activity validation schema
const createActivitySchema = Joi.object({
  action: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Action must be at least 2 characters long',
      'string.max': 'Action cannot exceed 200 characters',
      'any.required': 'Action is required'
    }),
  
  type: Joi.string()
    .valid('client', 'policy', 'claim', 'quotation', 'lead', 'payment', 'document', 'commission', 'reminder', 'system')
    .required()
    .messages({
      'any.only': 'Invalid activity type',
      'any.required': 'Activity type is required'
    }),
  
  description: Joi.string()
    .trim()
    .min(2)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Description must be at least 2 characters long',
      'string.max': 'Description cannot exceed 1000 characters',
      'any.required': 'Description is required'
    }),
  
  details: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Details cannot exceed 2000 characters'
    }),
  
  entityType: Joi.string()
    .valid('client', 'policy', 'claim', 'quotation', 'lead', 'agent', 'user')
    .required()
    .messages({
      'any.only': 'Invalid entity type',
      'any.required': 'Entity type is required'
    }),
  
  entityId: Joi.string()
    .required()
    .messages({
      'any.required': 'Entity ID is required'
    }),
  
  entityName: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.max': 'Entity name cannot exceed 100 characters',
      'any.required': 'Entity name is required'
    }),
  
  clientId: Joi.string()
    .optional(),
  
  clientName: Joi.string()
    .trim()
    .max(100)
    .optional(),
  
  agentId: Joi.string()
    .required()
    .messages({
      'any.required': 'Agent ID is required'
    }),
  
  agentName: Joi.string()
    .required()
    .messages({
      'any.required': 'Agent name is required'
    }),
  
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'User ID is required'
    }),
  
  userName: Joi.string()
    .required()
    .messages({
      'any.required': 'User name is required'
    }),
  
  metadata: Joi.object({
    policyId: Joi.string().optional(),
    policyNumber: Joi.string().max(50).optional(),
    claimId: Joi.string().optional(),
    claimNumber: Joi.string().max(50).optional(),
    quotationId: Joi.string().optional(),
    quoteId: Joi.string().max(50).optional(),
    leadId: Joi.string().optional(),
    amount: Joi.number().min(0).optional(),
    oldValue: Joi.string().max(500).optional(),
    newValue: Joi.string().max(500).optional(),
    ipAddress: Joi.string().max(45).optional(),
    userAgent: Joi.string().max(500).optional()
  }).optional(),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .default('medium')
    .messages({
      'any.only': 'Invalid priority value'
    }),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .optional(),
  
  isSystemGenerated: Joi.boolean()
    .default(false)
    .optional(),
  
  isVisible: Joi.boolean()
    .default(true)
    .optional()
});

// Update activity validation schema
const updateActivitySchema = Joi.object({
  action: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional(),
  
  description: Joi.string()
    .trim()
    .min(2)
    .max(1000)
    .optional(),
  
  details: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow(''),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical')
    .optional(),
  
  status: Joi.string()
    .valid('active', 'archived', 'hidden')
    .optional(),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .optional(),
  
  isVisible: Joi.boolean()
    .optional(),
  
  metadata: Joi.object({
    policyId: Joi.string().optional(),
    policyNumber: Joi.string().max(50).optional(),
    claimId: Joi.string().optional(),
    claimNumber: Joi.string().max(50).optional(),
    quotationId: Joi.string().optional(),
    quoteId: Joi.string().max(50).optional(),
    leadId: Joi.string().optional(),
    amount: Joi.number().min(0).optional(),
    oldValue: Joi.string().max(500).optional(),
    newValue: Joi.string().max(500).optional(),
    ipAddress: Joi.string().max(45).optional(),
    userAgent: Joi.string().max(500).optional()
  }).optional()
});

// Query parameter validation schemas
const queryParamsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),
  
  type: Joi.string()
    .valid('client', 'policy', 'claim', 'quotation', 'lead', 'payment', 'document', 'commission', 'reminder', 'system', 'all')
    .optional(),
  
  entityType: Joi.string()
    .valid('client', 'policy', 'claim', 'quotation', 'lead', 'agent', 'user', 'all')
    .optional(),
  
  agentId: Joi.string()
    .optional(),
  
  clientId: Joi.string()
    .optional(),
  
  userId: Joi.string()
    .optional(),
  
  entityId: Joi.string()
    .optional(),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'critical', 'all')
    .optional(),
  
  status: Joi.string()
    .valid('active', 'archived', 'hidden', 'all')
    .optional(),
  
  search: Joi.string()
    .max(100)
    .optional(),
  
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'action', 'type', 'priority', 'entityName')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
  
  dateFilter: Joi.string()
    .valid('today', 'yesterday', 'last7days', 'last30days', 'last90days', 'all')
    .optional(),
  
  startDate: Joi.date()
    .optional(),
  
  endDate: Joi.date()
    .optional(),
  
  isRecent: Joi.boolean()
    .optional(),
  
  tags: Joi.string()
    .optional()
});

// Activity statistics query parameters
const statsQuerySchema = Joi.object({
  agentId: Joi.string()
    .optional(),
  
  startDate: Joi.date()
    .optional(),
  
  endDate: Joi.date()
    .optional(),
  
  period: Joi.string()
    .valid('today', 'yesterday', 'last7days', 'last30days', 'last90days', 'custom')
    .default('last30days'),
  
  groupBy: Joi.string()
    .valid('type', 'agent', 'client', 'day', 'week', 'month')
    .optional()
});

// Bulk action validation schema
const bulkActionSchema = Joi.object({
  activityIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one activity ID is required',
      'any.required': 'Activity IDs are required'
    }),
  
  action: Joi.string()
    .valid('archive', 'hide', 'show', 'delete', 'addTag', 'removeTag', 'changePriority')
    .required()
    .messages({
      'any.only': 'Invalid bulk action',
      'any.required': 'Bulk action is required'
    }),
  
  value: Joi.when('action', {
    is: Joi.valid('addTag', 'removeTag'),
    then: Joi.string().max(50).required(),
    otherwise: Joi.when('action', {
      is: 'changePriority',
      then: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
      otherwise: Joi.forbidden()
    })
  })
});

module.exports = {
  createActivitySchema,
  updateActivitySchema,
  queryParamsSchema,
  statsQuerySchema,
  bulkActionSchema
};
