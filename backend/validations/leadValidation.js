
const Joi = require('joi');

// Create lead validation schema
const createLeadSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]{10,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid phone number format',
      'any.required': 'Phone number is required'
    }),
  
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required'
    }),
  
  address: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Address cannot exceed 500 characters'
    }),
  
  source: Joi.string()
    .valid('Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Advertisement', 'Other')
    .required()
    .messages({
      'any.only': 'Invalid source value',
      'any.required': 'Source is required'
    }),
  
  product: Joi.string()
    .valid('Health Insurance', 'Life Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance', 'Business Insurance')
    .required()
    .messages({
      'any.only': 'Invalid product value',
      'any.required': 'Product is required'
    }),
  
  status: Joi.string()
    .valid('New', 'In Progress', 'Qualified', 'Not Interested', 'Converted', 'Lost')
    .default('New')
    .messages({
      'any.only': 'Invalid status value'
    }),
  
  budget: Joi.number()
    .min(0)
    .max(10000000)
    .optional()
    .messages({
      'number.min': 'Budget cannot be negative',
      'number.max': 'Budget cannot exceed 10,000,000'
    }),
  
  assignedTo: Joi.object({
    agentId: Joi.string().optional(),
    name: Joi.string().required()
  }).required(),
  
  priority: Joi.string()
    .valid('High', 'Medium', 'Low')
    .default('Medium')
    .messages({
      'any.only': 'Invalid priority value'
    }),
  
  additionalInfo: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Additional info cannot exceed 1000 characters'
    }),
  
  nextFollowUp: Joi.date()
    .optional()
    .messages({
      'date.base': 'Invalid follow-up date'
    }),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .optional()
    .messages({
      'string.max': 'Tag cannot exceed 50 characters'
    }),
  
  customFields: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .optional()
});

// Update lead validation schema (all fields optional except those that shouldn't change)
const updateLeadSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional(),
  
  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]{10,15}$/)
    .optional(),
  
  email: Joi.string()
    .email()
    .lowercase()
    .optional(),
  
  address: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  
  source: Joi.string()
    .valid('Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Advertisement', 'Other')
    .optional(),
  
  product: Joi.string()
    .valid('Health Insurance', 'Life Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance', 'Business Insurance')
    .optional(),
  
  status: Joi.string()
    .valid('New', 'In Progress', 'Qualified', 'Not Interested', 'Converted', 'Lost')
    .optional(),
  
  budget: Joi.number()
    .min(0)
    .max(10000000)
    .optional(),
  
  assignedTo: Joi.object({
    agentId: Joi.string().optional(),
    name: Joi.string().required()
  }).optional(),
  
  priority: Joi.string()
    .valid('High', 'Medium', 'Low')
    .optional(),
  
  additionalInfo: Joi.string()
    .max(1000)
    .optional()
    .allow(''),
  
  nextFollowUp: Joi.date()
    .optional()
    .allow(null),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .optional(),
  
  customFields: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .optional()
});

// Follow-up validation schema
const followUpSchema = Joi.object({
  date: Joi.date()
    .required()
    .messages({
      'any.required': 'Follow-up date is required',
      'date.base': 'Invalid date format'
    }),
  
  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'any.required': 'Follow-up time is required',
      'string.pattern.base': 'Invalid time format (HH:MM)'
    }),
  
  type: Joi.string()
    .valid('Call', 'Email', 'Meeting', 'SMS', 'WhatsApp')
    .required()
    .messages({
      'any.only': 'Invalid follow-up type',
      'any.required': 'Follow-up type is required'
    }),
  
  outcome: Joi.string()
    .max(1000)
    .required()
    .messages({
      'any.required': 'Follow-up outcome is required',
      'string.max': 'Outcome cannot exceed 1000 characters'
    }),
  
  nextAction: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Next action cannot exceed 500 characters'
    }),
  
  createdBy: Joi.string()
    .required()
    .messages({
      'any.required': 'Created by field is required'
    })
});

// Note validation schema
const noteSchema = Joi.object({
  content: Joi.string()
    .max(2000)
    .required()
    .messages({
      'any.required': 'Note content is required',
      'string.max': 'Note cannot exceed 2000 characters'
    }),
  
  createdBy: Joi.string()
    .required()
    .messages({
      'any.required': 'Created by field is required'
    })
});

// Assignment validation schema
const assignmentSchema = Joi.object({
  agentId: Joi.string()
    .required()
    .messages({
      'any.required': 'Agent ID is required'
    }),
  
  agentName: Joi.string()
    .required()
    .messages({
      'any.required': 'Agent name is required'
    })
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
    .default(10),
  
  status: Joi.string()
    .valid('New', 'In Progress', 'Qualified', 'Not Interested', 'Converted', 'Lost', 'all')
    .optional(),
  
  source: Joi.string()
    .valid('Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Advertisement', 'Other', 'all')
    .optional(),
  
  priority: Joi.string()
    .valid('High', 'Medium', 'Low', 'all')
    .optional(),
  
  assignedTo: Joi.string()
    .optional(),
  
  search: Joi.string()
    .max(100)
    .optional(),
  
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'name', 'lastInteraction', 'nextFollowUp', 'priority')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
  
  dateFrom: Joi.date()
    .optional(),
  
  dateTo: Joi.date()
    .optional()
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  followUpSchema,
  noteSchema,
  assignmentSchema,
  queryParamsSchema
};
