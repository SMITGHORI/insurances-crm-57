
const Joi = require('joi');

/**
 * Validation schema for creating a new claim
 */
const claimValidation = Joi.object({
  clientId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Client ID must be a valid MongoDB ObjectId',
      'any.required': 'Client ID is required'
    }),

  policyId: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Policy ID must be a valid MongoDB ObjectId',
      'any.required': 'Policy ID is required'
    }),

  claimType: Joi.string()
    .required()
    .valid(
      'Auto', 'Home', 'Life', 'Health', 'Travel', 
      'Business', 'Disability', 'Property', 'Liability', 
      'Workers Compensation'
    )
    .messages({
      'any.required': 'Claim type is required',
      'any.only': 'Invalid claim type'
    }),

  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Urgent')
    .default('Medium'),

  claimAmount: Joi.number()
    .required()
    .min(1)
    .max(10000000)
    .messages({
      'number.min': 'Claim amount must be greater than 0',
      'number.max': 'Claim amount cannot exceed 10,000,000',
      'any.required': 'Claim amount is required'
    }),

  deductible: Joi.number()
    .min(0)
    .default(0),

  incidentDate: Joi.date()
    .required()
    .max('now')
    .messages({
      'date.max': 'Incident date cannot be in the future',
      'any.required': 'Incident date is required'
    }),

  description: Joi.string()
    .required()
    .min(10)
    .max(2000)
    .trim()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required'
    }),

  assignedTo: Joi.string()
    .required()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Assigned agent ID must be a valid MongoDB ObjectId',
      'any.required': 'Assigned agent is required'
    }),

  estimatedSettlement: Joi.date()
    .min('now')
    .messages({
      'date.min': 'Estimated settlement date cannot be in the past'
    }),

  // Location information
  incidentLocation: Joi.object({
    address: Joi.string().max(255),
    city: Joi.string().max(100),
    state: Joi.string().max(50),
    zipCode: Joi.string().pattern(/^[0-9]{5}(-[0-9]{4})?$/),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    })
  }),

  // Contact information
  contactDetails: Joi.object({
    primaryContact: Joi.string().max(100),
    phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/),
    email: Joi.string().email(),
    alternateContact: Joi.string().max(100)
  }),

  // Third party information
  thirdParty: Joi.object({
    name: Joi.string().max(100),
    insuranceCompany: Joi.string().max(100),
    policyNumber: Joi.string().max(50),
    contactNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/)
  })
});

/**
 * Validation schema for updating a claim
 */
const updateClaimValidation = Joi.object({
  claimType: Joi.string()
    .valid(
      'Auto', 'Home', 'Life', 'Health', 'Travel', 
      'Business', 'Disability', 'Property', 'Liability', 
      'Workers Compensation'
    ),

  status: Joi.string()
    .valid(
      'Reported', 'Under Review', 'Pending', 'Approved', 
      'Rejected', 'Settled', 'Closed'
    ),

  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Urgent'),

  claimAmount: Joi.number()
    .min(1)
    .max(10000000),

  approvedAmount: Joi.number()
    .min(0)
    .max(Joi.ref('claimAmount'))
    .messages({
      'number.max': 'Approved amount cannot exceed claim amount'
    }),

  deductible: Joi.number()
    .min(0),

  incidentDate: Joi.date()
    .max('now'),

  description: Joi.string()
    .min(10)
    .max(2000)
    .trim(),

  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/),

  estimatedSettlement: Joi.date()
    .min('now'),

  actualSettlement: Joi.date(),

  incidentLocation: Joi.object({
    address: Joi.string().max(255),
    city: Joi.string().max(100),
    state: Joi.string().max(50),
    zipCode: Joi.string().pattern(/^[0-9]{5}(-[0-9]{4})?$/),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180)
    })
  }),

  contactDetails: Joi.object({
    primaryContact: Joi.string().max(100),
    phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/),
    email: Joi.string().email(),
    alternateContact: Joi.string().max(100)
  }),

  thirdParty: Joi.object({
    name: Joi.string().max(100),
    insuranceCompany: Joi.string().max(100),
    policyNumber: Joi.string().max(50),
    contactNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/)
  }),

  financial: Joi.object({
    totalIncurred: Joi.number().min(0),
    totalPaid: Joi.number().min(0),
    outstanding: Joi.number().min(0),
    reserves: Joi.number().min(0)
  }),

  riskFactors: Joi.object({
    fraudIndicators: Joi.array().items(Joi.string()),
    riskScore: Joi.number().min(0).max(100),
    investigationRequired: Joi.boolean()
  })
});

/**
 * Validation schema for claim document upload
 */
const claimDocumentValidation = Joi.object({
  documentType: Joi.string()
    .required()
    .valid(
      'incident_report', 'police_report', 'medical_report', 
      'repair_estimate', 'receipt', 'photo_evidence', 
      'witness_statement', 'insurance_form', 'other'
    )
    .messages({
      'any.required': 'Document type is required',
      'any.only': 'Invalid document type'
    }),

  name: Joi.string()
    .max(255)
    .trim()
    .messages({
      'string.max': 'Document name cannot exceed 255 characters'
    })
});

/**
 * Validation schema for adding claim notes
 */
const claimNoteValidation = Joi.object({
  content: Joi.string()
    .required()
    .min(1)
    .max(2000)
    .trim()
    .messages({
      'string.min': 'Note content cannot be empty',
      'string.max': 'Note content cannot exceed 2000 characters',
      'any.required': 'Note content is required'
    }),

  type: Joi.string()
    .valid('internal', 'client_communication', 'system')
    .default('internal'),

  priority: Joi.string()
    .valid('low', 'normal', 'high', 'urgent')
    .default('normal')
});

/**
 * Validation schema for updating claim status
 */
const claimStatusValidation = Joi.object({
  status: Joi.string()
    .required()
    .valid(
      'Reported', 'Under Review', 'Pending', 'Approved', 
      'Rejected', 'Settled', 'Closed'
    )
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Invalid status value'
    }),

  reason: Joi.string()
    .max(500)
    .trim()
    .messages({
      'string.max': 'Reason cannot exceed 500 characters'
    }),

  approvedAmount: Joi.number()
    .min(0)
    .max(10000000)
    .when('status', {
      is: 'Approved',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'number.min': 'Approved amount must be greater than or equal to 0',
      'number.max': 'Approved amount cannot exceed 10,000,000',
      'any.required': 'Approved amount is required when status is Approved'
    })
});

/**
 * Validation schema for bulk update claims
 */
const bulkUpdateClaimsValidation = Joi.object({
  claimIds: Joi.array()
    .items(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one claim ID is required',
      'array.max': 'Cannot update more than 100 claims at once',
      'any.required': 'Claim IDs are required'
    }),

  updateData: Joi.object({
    status: Joi.string()
      .valid(
        'Reported', 'Under Review', 'Pending', 'Approved', 
        'Rejected', 'Settled', 'Closed'
      ),

    priority: Joi.string()
      .valid('Low', 'Medium', 'High', 'Urgent'),

    assignedTo: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/),

    claimType: Joi.string()
      .valid(
        'Auto', 'Home', 'Life', 'Health', 'Travel', 
        'Business', 'Disability', 'Property', 'Liability', 
        'Workers Compensation'
      )
  })
    .min(1)
    .required()
    .messages({
      'object.min': 'At least one field to update is required',
      'any.required': 'Update data is required'
    })
});

/**
 * Validation schema for search parameters
 */
const searchValidation = Joi.object({
  query: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Search query must be at least 2 characters long',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query is required'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
});

module.exports = {
  claimValidation,
  updateClaimValidation,
  claimDocumentValidation,
  claimNoteValidation,
  claimStatusValidation,
  bulkUpdateClaimsValidation,
  searchValidation
};
