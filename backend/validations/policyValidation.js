
const Joi = require('joi');

/**
 * Premium validation schema
 */
const premiumSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Premium amount must be a number',
      'number.positive': 'Premium amount must be positive',
      'any.required': 'Premium amount is required'
    }),
  
  frequency: Joi.string()
    .valid('monthly', 'quarterly', 'semi-annual', 'annual')
    .required()
    .messages({
      'string.base': 'Premium frequency must be a string',
      'any.only': 'Premium frequency must be monthly, quarterly, semi-annual, or annual',
      'any.required': 'Premium frequency is required'
    }),
  
  nextDueDate: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.base': 'Next due date must be a valid date',
      'date.min': 'Next due date must be in the future'
    })
});

/**
 * Coverage validation schema
 */
const coverageSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Coverage amount must be a number',
      'number.positive': 'Coverage amount must be positive',
      'any.required': 'Coverage amount is required'
    }),
  
  deductible: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.base': 'Deductible must be a number',
      'number.min': 'Deductible cannot be negative'
    }),
  
  benefits: Joi.array()
    .items(Joi.string().trim().max(200))
    .default([])
    .messages({
      'array.base': 'Benefits must be an array',
      'string.max': 'Each benefit cannot exceed 200 characters'
    }),
  
  exclusions: Joi.array()
    .items(Joi.string().trim().max(200))
    .default([])
    .messages({
      'array.base': 'Exclusions must be an array',
      'string.max': 'Each exclusion cannot exceed 200 characters'
    })
});

/**
 * Commission validation schema
 */
const commissionSchema = Joi.object({
  rate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Commission rate must be a number',
      'number.min': 'Commission rate cannot be negative',
      'number.max': 'Commission rate cannot exceed 100%',
      'any.required': 'Commission rate is required'
    }),
  
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Commission amount must be a number',
      'number.positive': 'Commission amount must be positive',
      'any.required': 'Commission amount is required'
    }),
  
  paid: Joi.boolean()
    .default(false),
  
  paidDate: Joi.date()
    .max('now')
    .when('paid', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'date.base': 'Paid date must be a valid date',
      'date.max': 'Paid date cannot be in the future',
      'any.required': 'Paid date is required when commission is marked as paid',
      'any.unknown': 'Paid date should not be provided when commission is not paid'
    })
});

/**
 * Create policy validation schema
 */
const policyValidation = Joi.object({
  policyNumber: Joi.string()
    .pattern(/^POL-\d{4}-\d{3,}$/)
    .uppercase()
    .optional()
    .messages({
      'string.base': 'Policy number must be a string',
      'string.pattern.base': 'Policy number must follow format: POL-YYYY-XXX'
    }),
  
  clientId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.base': 'Client ID must be a string',
      'string.pattern.base': 'Client ID must be a valid ObjectId',
      'any.required': 'Client ID is required'
    }),
  
  type: Joi.string()
    .valid('life', 'health', 'auto', 'home', 'business', 'travel', 'disability', 'other')
    .required()
    .messages({
      'string.base': 'Policy type must be a string',
      'any.only': 'Policy type must be one of: life, health, auto, home, business, travel, disability, other',
      'any.required': 'Policy type is required'
    }),
  
  subType: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Policy subtype must be a string',
      'string.max': 'Policy subtype cannot exceed 100 characters'
    }),
  
  status: Joi.string()
    .valid('active', 'pending', 'expired', 'cancelled', 'suspended', 'lapsed')
    .default('pending')
    .messages({
      'string.base': 'Policy status must be a string',
      'any.only': 'Policy status must be one of: active, pending, expired, cancelled, suspended, lapsed'
    }),
  
  company: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.base': 'Insurance company must be a string',
      'string.max': 'Insurance company name cannot exceed 200 characters',
      'any.required': 'Insurance company is required'
    }),
  
  companyPolicyNumber: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Company policy number must be a string',
      'string.max': 'Company policy number cannot exceed 100 characters'
    }),
  
  premium: premiumSchema.required(),
  coverage: coverageSchema.required(),
  
  startDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),
  
  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required'
    }),
  
  assignedAgentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.base': 'Assigned agent ID must be a string',
      'string.pattern.base': 'Assigned agent ID must be a valid ObjectId',
      'any.required': 'Assigned agent ID is required'
    }),
  
  commission: commissionSchema.required(),
  
  tags: Joi.array()
    .items(Joi.string().trim().lowercase().max(50))
    .default([])
    .messages({
      'array.base': 'Tags must be an array',
      'string.max': 'Each tag cannot exceed 50 characters'
    }),
  
  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
    .messages({
      'string.base': 'Priority must be a string',
      'any.only': 'Priority must be one of: low, medium, high, urgent'
    }),
  
  isAutoRenewal: Joi.boolean()
    .default(false),
  
  lastContactDate: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.base': 'Last contact date must be a valid date',
      'date.max': 'Last contact date cannot be in the future'
    }),
  
  nextFollowUpDate: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.base': 'Next follow up date must be a valid date',
      'date.min': 'Next follow up date must be in the future'
    })
});

/**
 * Update policy validation schema (all fields optional)
 */
const updatePolicyValidation = policyValidation.fork(
  [
    'clientId',
    'type',
    'company',
    'premium',
    'coverage',
    'startDate',
    'endDate',
    'assignedAgentId',
    'commission'
  ],
  (schema) => schema.optional()
);

/**
 * Policy document validation schema
 */
const policyDocumentValidation = Joi.object({
  documentType: Joi.string()
    .valid(
      'policy_document',
      'application_form',
      'medical_report',
      'claim_form',
      'amendment',
      'renewal_document',
      'payment_receipt',
      'beneficiary_form',
      'other'
    )
    .required()
    .messages({
      'string.base': 'Document type must be a string',
      'any.only': 'Document type must be a valid type',
      'any.required': 'Document type is required'
    }),
  
  name: Joi.string()
    .trim()
    .max(255)
    .optional()
    .messages({
      'string.base': 'Document name must be a string',
      'string.max': 'Document name cannot exceed 255 characters'
    })
});

/**
 * Payment validation schema
 */
const paymentValidation = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Payment amount must be a number',
      'number.positive': 'Payment amount must be positive',
      'any.required': 'Payment amount is required'
    }),
  
  method: Joi.string()
    .valid('cash', 'check', 'bank_transfer', 'credit_card', 'debit_card', 'online', 'other')
    .required()
    .messages({
      'string.base': 'Payment method must be a string',
      'any.only': 'Payment method must be valid',
      'any.required': 'Payment method is required'
    }),
  
  status: Joi.string()
    .valid('pending', 'completed', 'failed', 'refunded')
    .default('completed')
    .messages({
      'string.base': 'Payment status must be a string',
      'any.only': 'Payment status must be valid'
    }),
  
  transactionId: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Transaction ID must be a string',
      'string.max': 'Transaction ID cannot exceed 100 characters'
    }),
  
  notes: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Payment notes must be a string',
      'string.max': 'Payment notes cannot exceed 500 characters'
    })
});

/**
 * Renewal validation schema
 */
const renewalValidation = Joi.object({
  newEndDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.base': 'New end date must be a valid date',
      'date.min': 'New end date must be in the future',
      'any.required': 'New end date is required'
    }),
  
  premium: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Renewal premium must be a number',
      'number.positive': 'Renewal premium must be positive'
    }),
  
  agentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.base': 'Agent ID must be a string',
      'string.pattern.base': 'Agent ID must be a valid ObjectId'
    }),
  
  notes: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Renewal notes must be a string',
      'string.max': 'Renewal notes cannot exceed 500 characters'
    })
});

/**
 * Note validation schema
 */
const noteValidation = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.base': 'Note content must be a string',
      'string.min': 'Note content cannot be empty',
      'string.max': 'Note content cannot exceed 1000 characters',
      'any.required': 'Note content is required'
    }),
  
  isPrivate: Joi.boolean()
    .default(false),
  
  tags: Joi.array()
    .items(Joi.string().trim().lowercase().max(50))
    .default([])
    .messages({
      'array.base': 'Tags must be an array',
      'string.max': 'Each tag cannot exceed 50 characters'
    })
});

/**
 * Bulk assign validation schema
 */
const bulkAssignValidation = Joi.object({
  policyIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      'array.base': 'Policy IDs must be an array',
      'array.min': 'At least one policy ID is required',
      'string.pattern.base': 'Each policy ID must be a valid ObjectId',
      'any.required': 'Policy IDs are required'
    }),
  
  agentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.base': 'Agent ID must be a string',
      'string.pattern.base': 'Agent ID must be a valid ObjectId',
      'any.required': 'Agent ID is required'
    })
});

module.exports = {
  policyValidation,
  updatePolicyValidation,
  policyDocumentValidation,
  paymentValidation,
  renewalValidation,
  noteValidation,
  bulkAssignValidation
};
