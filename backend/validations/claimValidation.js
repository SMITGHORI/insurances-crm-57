
const Joi = require('joi');

const claimValidation = Joi.object({
  clientId: Joi.string()
    .required()
    .messages({
      'any.required': 'Client ID is required',
      'string.empty': 'Client ID cannot be empty'
    }),
  
  policyId: Joi.string()
    .required()
    .messages({
      'any.required': 'Policy ID is required',
      'string.empty': 'Policy ID cannot be empty'
    }),
  
  claimType: Joi.string()
    .valid('Health', 'Life', 'Vehicle', 'Property', 'Travel', 'Disability')
    .required()
    .messages({
      'any.required': 'Claim type is required',
      'any.only': 'Claim type must be one of: Health, Life, Vehicle, Property, Travel, Disability'
    }),
  
  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Critical')
    .default('Medium')
    .messages({
      'any.only': 'Priority must be one of: Low, Medium, High, Critical'
    }),
  
  claimAmount: Joi.number()
    .positive()
    .required()
    .messages({
      'any.required': 'Claim amount is required',
      'number.positive': 'Claim amount must be a positive number'
    }),
  
  incidentDate: Joi.date()
    .max('now')
    .required()
    .messages({
      'any.required': 'Incident date is required',
      'date.max': 'Incident date cannot be in the future'
    }),
  
  description: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'any.required': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  
  assignedTo: Joi.string()
    .required()
    .messages({
      'any.required': 'Assigned agent is required'
    }),
  
  estimatedSettlement: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.min': 'Estimated settlement date cannot be in the past'
    }),
  
  incidentLocation: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional()
    }).optional()
  }).optional(),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.max': 'Each tag cannot exceed 50 characters'
    })
});

const updateClaimValidation = Joi.object({
  claimType: Joi.string()
    .valid('Health', 'Life', 'Vehicle', 'Property', 'Travel', 'Disability')
    .optional(),
  
  status: Joi.string()
    .valid('Draft', 'Submitted', 'Under Review', 'Pending Documentation', 'Under Investigation', 'Approved', 'Rejected', 'Settled', 'Closed')
    .optional(),
  
  priority: Joi.string()
    .valid('Low', 'Medium', 'High', 'Critical')
    .optional(),
  
  claimAmount: Joi.number()
    .positive()
    .optional(),
  
  approvedAmount: Joi.number()
    .min(0)
    .optional(),
  
  settledAmount: Joi.number()
    .min(0)
    .optional(),
  
  deductibleAmount: Joi.number()
    .min(0)
    .optional(),
  
  incidentDate: Joi.date()
    .max('now')
    .optional(),
  
  description: Joi.string()
    .min(10)
    .max(2000)
    .optional(),
  
  assignedTo: Joi.string()
    .optional(),
  
  investigatorId: Joi.string()
    .optional(),
  
  estimatedSettlement: Joi.date()
    .optional(),
  
  incidentLocation: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional()
    }).optional()
  }).optional(),
  
  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)
    .optional(),
  
  paymentDetails: Joi.object({
    paymentMethod: Joi.string()
      .valid('bank_transfer', 'check', 'card', 'cash')
      .optional(),
    bankDetails: Joi.object({
      accountName: Joi.string().optional(),
      accountNumber: Joi.string().optional(),
      bankName: Joi.string().optional(),
      routingNumber: Joi.string().optional(),
      swiftCode: Joi.string().optional()
    }).optional(),
    paymentReference: Joi.string().optional(),
    paymentDate: Joi.date().optional(),
    transactionId: Joi.string().optional()
  }).optional(),
  
  renewalEligible: Joi.boolean().optional()
});

const claimDocumentValidation = Joi.object({
  documentType: Joi.string()
    .valid('medical_report', 'police_report', 'damage_assessment', 'receipt', 'invoice', 'photo', 'other')
    .required()
    .messages({
      'any.required': 'Document type is required',
      'any.only': 'Document type must be one of: medical_report, police_report, damage_assessment, receipt, invoice, photo, other'
    }),
  
  name: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Document name cannot exceed 255 characters'
    })
});

const claimNoteValidation = Joi.object({
  content: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'any.required': 'Note content is required',
      'string.min': 'Note content cannot be empty',
      'string.max': 'Note content cannot exceed 2000 characters'
    }),
  
  type: Joi.string()
    .valid('internal', 'client', 'system')
    .default('internal')
    .messages({
      'any.only': 'Note type must be one of: internal, client, system'
    }),
  
  priority: Joi.string()
    .valid('low', 'normal', 'high', 'urgent')
    .default('normal')
    .messages({
      'any.only': 'Priority must be one of: low, normal, high, urgent'
    })
});

const claimStatusValidation = Joi.object({
  status: Joi.string()
    .valid('Draft', 'Submitted', 'Under Review', 'Pending Documentation', 'Under Investigation', 'Approved', 'Rejected', 'Settled', 'Closed')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Invalid status value'
    }),
  
  reason: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Reason cannot exceed 500 characters'
    }),
  
  approvedAmount: Joi.number()
    .min(0)
    .when('status', {
      is: 'Approved',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Approved amount is required when approving a claim',
      'number.min': 'Approved amount cannot be negative'
    }),
  
  settledAmount: Joi.number()
    .min(0)
    .when('status', {
      is: 'Settled',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.required': 'Settled amount is required when settling a claim',
      'number.min': 'Settled amount cannot be negative'
    }),
  
  paymentDetails: Joi.object({
    paymentMethod: Joi.string()
      .valid('bank_transfer', 'check', 'card', 'cash')
      .optional(),
    paymentReference: Joi.string().optional(),
    transactionId: Joi.string().optional()
  }).when('status', {
    is: 'Settled',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  })
});

const bulkUpdateClaimsValidation = Joi.object({
  claimIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .max(100)
    .required()
    .messages({
      'any.required': 'Claim IDs are required',
      'array.min': 'At least one claim ID is required',
      'array.max': 'Maximum 100 claims can be updated at once'
    }),
  
  updateData: Joi.object({
    status: Joi.string()
      .valid('Draft', 'Submitted', 'Under Review', 'Pending Documentation', 'Under Investigation', 'Approved', 'Rejected', 'Settled', 'Closed')
      .optional(),
    
    priority: Joi.string()
      .valid('Low', 'Medium', 'High', 'Critical')
      .optional(),
    
    assignedTo: Joi.string().optional(),
    
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .optional()
  }).min(1).required()
  .messages({
    'object.min': 'At least one field must be provided for update'
  })
});

const communicationValidation = Joi.object({
  type: Joi.string()
    .valid('email', 'phone', 'sms', 'letter', 'meeting')
    .required()
    .messages({
      'any.required': 'Communication type is required',
      'any.only': 'Communication type must be one of: email, phone, sms, letter, meeting'
    }),
  
  direction: Joi.string()
    .valid('inbound', 'outbound')
    .required()
    .messages({
      'any.required': 'Communication direction is required',
      'any.only': 'Direction must be either inbound or outbound'
    }),
  
  subject: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Subject cannot exceed 200 characters'
    }),
  
  content: Joi.string()
    .max(5000)
    .optional()
    .messages({
      'string.max': 'Content cannot exceed 5000 characters'
    }),
  
  participantId: Joi.string().optional(),
  
  attachments: Joi.array()
    .items(Joi.string())
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 attachments allowed'
    })
});

module.exports = {
  claimValidation,
  updateClaimValidation,
  claimDocumentValidation,
  claimNoteValidation,
  claimStatusValidation,
  bulkUpdateClaimsValidation,
  communicationValidation
};
