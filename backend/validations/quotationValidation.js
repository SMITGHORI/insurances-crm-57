
const Joi = require('joi');

// Product validation schema
const productSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.max': 'Product name cannot exceed 100 characters',
      'any.required': 'Product name is required'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Product description cannot exceed 500 characters'
    }),
  
  sumInsured: Joi.number()
    .min(0)
    .max(100000000)
    .optional()
    .messages({
      'number.min': 'Sum insured cannot be negative',
      'number.max': 'Sum insured cannot exceed 100,000,000'
    }),
  
  premium: Joi.number()
    .min(0)
    .max(10000000)
    .required()
    .messages({
      'number.min': 'Premium cannot be negative',
      'number.max': 'Premium cannot exceed 10,000,000',
      'any.required': 'Premium is required'
    })
});

// Create quotation validation schema
const createQuotationSchema = Joi.object({
  clientId: Joi.string()
    .required()
    .messages({
      'any.required': 'Client ID is required'
    }),
  
  clientName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Client name must be at least 2 characters long',
      'string.max': 'Client name cannot exceed 100 characters',
      'any.required': 'Client name is required'
    }),
  
  insuranceType: Joi.string()
    .valid('Health Insurance', 'Life Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance', 'Business Insurance', 'Group Health Insurance')
    .required()
    .messages({
      'any.only': 'Invalid insurance type',
      'any.required': 'Insurance type is required'
    }),
  
  insuranceCompany: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.max': 'Insurance company name cannot exceed 100 characters',
      'any.required': 'Insurance company is required'
    }),
  
  products: Joi.array()
    .items(productSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one product is required',
      'any.required': 'Products are required'
    }),
  
  sumInsured: Joi.number()
    .min(0)
    .max(100000000)
    .required()
    .messages({
      'number.min': 'Sum insured cannot be negative',
      'number.max': 'Sum insured cannot exceed 100,000,000',
      'any.required': 'Sum insured is required'
    }),
  
  premium: Joi.number()
    .min(0)
    .max(10000000)
    .required()
    .messages({
      'number.min': 'Premium cannot be negative',
      'number.max': 'Premium cannot exceed 10,000,000',
      'any.required': 'Premium is required'
    }),
  
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
  
  status: Joi.string()
    .valid('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')
    .default('draft')
    .messages({
      'any.only': 'Invalid status value'
    }),
  
  validUntil: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.min': 'Valid until date must be in the future',
      'any.required': 'Valid until date is required'
    }),
  
  notes: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 2000 characters'
    }),
  
  customFields: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .optional()
});

// Update quotation validation schema
const updateQuotationSchema = Joi.object({
  clientName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional(),
  
  insuranceType: Joi.string()
    .valid('Health Insurance', 'Life Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance', 'Business Insurance', 'Group Health Insurance')
    .optional(),
  
  insuranceCompany: Joi.string()
    .trim()
    .max(100)
    .optional(),
  
  products: Joi.array()
    .items(productSchema)
    .min(1)
    .optional(),
  
  sumInsured: Joi.number()
    .min(0)
    .max(100000000)
    .optional(),
  
  premium: Joi.number()
    .min(0)
    .max(10000000)
    .optional(),
  
  agentId: Joi.string()
    .optional(),
  
  agentName: Joi.string()
    .optional(),
  
  status: Joi.string()
    .valid('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')
    .optional(),
  
  validUntil: Joi.date()
    .optional(),
  
  notes: Joi.string()
    .max(2000)
    .optional()
    .allow(''),
  
  rejectionReason: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  
  convertedToPolicy: Joi.string()
    .optional(),
  
  customFields: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .optional()
});

// Send quotation validation schema
const sendQuotationSchema = Joi.object({
  emailTo: Joi.string()
    .email()
    .optional(),
  
  emailSubject: Joi.string()
    .max(200)
    .optional(),
  
  emailMessage: Joi.string()
    .max(2000)
    .optional()
});

// Status update validation schema
const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')
    .required()
    .messages({
      'any.only': 'Invalid status value',
      'any.required': 'Status is required'
    }),
  
  rejectionReason: Joi.when('status', {
    is: 'rejected',
    then: Joi.string().max(500).required(),
    otherwise: Joi.string().max(500).optional()
  }),
  
  convertedToPolicy: Joi.when('status', {
    is: 'accepted',
    then: Joi.string().optional(),
    otherwise: Joi.forbidden()
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
    .valid('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'all')
    .optional(),
  
  insuranceType: Joi.string()
    .valid('Health Insurance', 'Life Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance', 'Business Insurance', 'Group Health Insurance', 'all')
    .optional(),
  
  agentId: Joi.string()
    .optional(),
  
  clientId: Joi.string()
    .optional(),
  
  search: Joi.string()
    .max(100)
    .optional(),
  
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'premium', 'validUntil', 'clientName', 'sentDate')
    .default('createdAt'),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
  
  dateFrom: Joi.date()
    .optional(),
  
  dateTo: Joi.date()
    .optional(),
  
  validFrom: Joi.date()
    .optional(),
  
  validTo: Joi.date()
    .optional()
});

module.exports = {
  createQuotationSchema,
  updateQuotationSchema,
  sendQuotationSchema,
  statusUpdateSchema,
  queryParamsSchema
};
