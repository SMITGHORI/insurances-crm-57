
const Joi = require('joi');

/**
 * Personal Information Validation Schema
 */
const personalInfoSchema = Joi.object({
  dateOfBirth: Joi.date().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
  nationality: Joi.string().trim().max(100).optional(),
  maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed', 'separated').optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    relationship: Joi.string().trim().max(50).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    email: Joi.string().email().optional()
  }).optional()
});

/**
 * Address Validation Schema
 */
const addressSchema = Joi.object({
  street: Joi.string().trim().max(255).required(),
  city: Joi.string().trim().max(100).required(),
  state: Joi.string().trim().max(100).required(),
  zipCode: Joi.string().trim().max(20).required(),
  country: Joi.string().trim().max(100).default('USA'),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional()
  }).optional()
});

/**
 * Bank Details Validation Schema
 */
const bankDetailsSchema = Joi.object({
  accountNumber: Joi.string().pattern(/^\d{8,20}$/).required(),
  routingNumber: Joi.string().pattern(/^\d{9}$/).required(),
  bankName: Joi.string().trim().max(100).required(),
  accountType: Joi.string().valid('checking', 'savings').default('checking'),
  accountHolderName: Joi.string().trim().max(100).optional(),
  swiftCode: Joi.string().pattern(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/).uppercase().optional()
});

/**
 * Performance Targets Validation Schema
 */
const performanceTargetsSchema = Joi.object({
  policies: Joi.number().min(0).required(),
  premium: Joi.number().min(0).required()
});

/**
 * Education Validation Schema
 */
const educationSchema = Joi.object({
  degree: Joi.string().trim().max(100).optional(),
  institution: Joi.string().trim().max(100).optional(),
  graduationYear: Joi.number().min(1950).max(new Date().getFullYear()).optional(),
  field: Joi.string().trim().max(100).optional()
});

/**
 * Experience Validation Schema
 */
const experienceSchema = Joi.object({
  company: Joi.string().trim().max(100).required(),
  position: Joi.string().trim().max(100).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
  description: Joi.string().trim().max(500).optional()
});

/**
 * Certification Validation Schema
 */
const certificationSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  issuer: Joi.string().trim().max(100).required(),
  issueDate: Joi.date().required(),
  expiryDate: Joi.date().greater(Joi.ref('issueDate')).optional(),
  certificateNumber: Joi.string().trim().max(50).optional()
});

/**
 * Create Agent Validation Schema
 */
const agentValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Agent name is required',
      'string.min': 'Agent name must be at least 2 characters long',
      'string.max': 'Agent name cannot exceed 100 characters'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'string.empty': 'Phone number is required'
    }),

  status: Joi.string()
    .valid('active', 'inactive', 'onboarding', 'terminated', 'suspended')
    .default('onboarding'),

  role: Joi.string()
    .valid('agent', 'senior_agent', 'team_lead', 'manager')
    .default('agent'),

  specialization: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Specialization is required',
      'string.max': 'Specialization cannot exceed 100 characters'
    }),

  region: Joi.string()
    .trim()
    .max(50)
    .required()
    .messages({
      'string.empty': 'Region is required',
      'string.max': 'Region cannot exceed 50 characters'
    }),

  territory: Joi.string().trim().max(100).optional(),

  teamId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid team ID format'
    }),

  managerId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid manager ID format'
    }),

  licenseNumber: Joi.string()
    .trim()
    .alphanum()
    .min(5)
    .max(20)
    .required()
    .messages({
      'string.empty': 'License number is required',
      'string.alphanum': 'License number must contain only letters and numbers',
      'string.min': 'License number must be at least 5 characters long',
      'string.max': 'License number cannot exceed 20 characters'
    }),

  licenseExpiry: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.greater': 'License expiry date must be in the future',
      'any.required': 'License expiry date is required'
    }),

  licenseState: Joi.string()
    .trim()
    .uppercase()
    .length(2)
    .optional()
    .messages({
      'string.length': 'License state must be 2 characters long'
    }),

  hireDate: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.max': 'Hire date cannot be in the future',
      'any.required': 'Hire date is required'
    }),

  terminationDate: Joi.date()
    .greater(Joi.ref('hireDate'))
    .optional()
    .messages({
      'date.greater': 'Termination date must be after hire date'
    }),

  employmentType: Joi.string()
    .valid('full_time', 'part_time', 'contract', 'commission_only')
    .default('full_time'),

  commissionRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .required()
    .messages({
      'number.min': 'Commission rate cannot be negative',
      'number.max': 'Commission rate cannot exceed 100%',
      'any.required': 'Commission rate is required'
    }),

  baseSalary: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Base salary cannot be negative'
    }),

  commissionStructure: Joi.string()
    .valid('flat_rate', 'tiered', 'performance_based')
    .default('flat_rate'),

  personalInfo: personalInfoSchema.optional(),
  address: addressSchema.required(),
  bankDetails: bankDetailsSchema.optional(),

  education: Joi.array()
    .items(educationSchema)
    .optional(),

  experience: Joi.array()
    .items(experienceSchema)
    .optional(),

  certifications: Joi.array()
    .items(certificationSchema)
    .optional(),

  avatar: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    })
});

/**
 * Update Agent Validation Schema
 */
const updateAgentValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Agent name must be at least 2 characters long',
      'string.max': 'Agent name cannot exceed 100 characters'
    }),

  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  status: Joi.string()
    .valid('active', 'inactive', 'onboarding', 'terminated', 'suspended'),

  role: Joi.string()
    .valid('agent', 'senior_agent', 'team_lead', 'manager'),

  specialization: Joi.string()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Specialization cannot exceed 100 characters'
    }),

  region: Joi.string()
    .trim()
    .max(50)
    .messages({
      'string.max': 'Region cannot exceed 50 characters'
    }),

  territory: Joi.string().trim().max(100),

  teamId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid team ID format'
    }),

  managerId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'Invalid manager ID format'
    }),

  licenseNumber: Joi.string()
    .trim()
    .alphanum()
    .min(5)
    .max(20)
    .messages({
      'string.alphanum': 'License number must contain only letters and numbers',
      'string.min': 'License number must be at least 5 characters long',
      'string.max': 'License number cannot exceed 20 characters'
    }),

  licenseExpiry: Joi.date()
    .greater('now')
    .messages({
      'date.greater': 'License expiry date must be in the future'
    }),

  licenseState: Joi.string()
    .trim()
    .uppercase()
    .length(2)
    .messages({
      'string.length': 'License state must be 2 characters long'
    }),

  hireDate: Joi.date()
    .max('now')
    .messages({
      'date.max': 'Hire date cannot be in the future'
    }),

  terminationDate: Joi.date()
    .when('hireDate', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('hireDate')),
      otherwise: Joi.date()
    })
    .messages({
      'date.greater': 'Termination date must be after hire date'
    }),

  employmentType: Joi.string()
    .valid('full_time', 'part_time', 'contract', 'commission_only'),

  commissionRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .messages({
      'number.min': 'Commission rate cannot be negative',
      'number.max': 'Commission rate cannot exceed 100%'
    }),

  baseSalary: Joi.number()
    .min(0)
    .messages({
      'number.min': 'Base salary cannot be negative'
    }),

  commissionStructure: Joi.string()
    .valid('flat_rate', 'tiered', 'performance_based'),

  personalInfo: personalInfoSchema,
  address: addressSchema,
  bankDetails: bankDetailsSchema,

  education: Joi.array().items(educationSchema),
  experience: Joi.array().items(experienceSchema),
  certifications: Joi.array().items(certificationSchema),

  avatar: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    }),

  isEmailVerified: Joi.boolean(),
  isPhoneVerified: Joi.boolean()
});

/**
 * Agent Document Validation Schema
 */
const agentDocumentValidation = Joi.object({
  documentType: Joi.string()
    .valid('license', 'contract', 'certification', 'id_proof', 'address_proof', 'bank_details', 'resume', 'other')
    .required()
    .messages({
      'any.required': 'Document type is required',
      'any.only': 'Invalid document type'
    }),

  name: Joi.string()
    .trim()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Document name cannot exceed 255 characters'
    })
});

/**
 * Agent Note Validation Schema
 */
const agentNoteValidation = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Note content is required',
      'string.min': 'Note content cannot be empty',
      'string.max': 'Note content cannot exceed 2000 characters'
    }),

  isPrivate: Joi.boolean()
    .default(false),

  tags: Joi.array()
    .items(Joi.string().trim().lowercase().max(50))
    .max(10)
    .default([])
    .messages({
      'array.max': 'Cannot have more than 10 tags'
    }),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium')
});

/**
 * Performance Targets Validation Schema
 */
const performanceTargetsValidation = Joi.object({
  monthly: performanceTargetsSchema.optional(),
  quarterly: performanceTargetsSchema.optional(),
  annual: performanceTargetsSchema.optional()
}).min(1).messages({
  'object.min': 'At least one target period must be provided'
});

/**
 * Search Query Validation Schema
 */
const searchQueryValidation = Joi.object({
  query: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Search query is required',
      'string.min': 'Search query must be at least 1 character long',
      'string.max': 'Search query cannot exceed 100 characters'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    })
});

/**
 * Bulk Update Validation Schema
 */
const bulkUpdateValidation = Joi.object({
  agentIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one agent ID is required',
      'array.max': 'Cannot update more than 100 agents at once',
      'any.required': 'Agent IDs array is required'
    }),

  updateData: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'onboarding', 'terminated', 'suspended'),
    region: Joi.string().trim().max(50),
    teamId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    managerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    commissionRate: Joi.number().min(0).max(100).precision(2)
  })
  .min(1)
  .required()
  .messages({
    'object.min': 'At least one field to update is required',
    'any.required': 'Update data is required'
  })
});

module.exports = {
  agentValidation,
  updateAgentValidation,
  agentDocumentValidation,
  agentNoteValidation,
  performanceTargetsValidation,
  searchQueryValidation,
  bulkUpdateValidation
};
