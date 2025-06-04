
const Joi = require('joi');

// Common validation schemas
const commonFields = {
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Phone number must be 10 digits',
    'any.required': 'Phone number is required'
  }),
  altPhone: Joi.string().pattern(/^\d{10}$/).optional().messages({
    'string.pattern.base': 'Alternate phone number must be 10 digits'
  }),
  address: Joi.string().min(1).max(500).required().messages({
    'string.min': 'Address is required',
    'string.max': 'Address cannot exceed 500 characters'
  }),
  city: Joi.string().min(1).max(100).required().messages({
    'string.min': 'City is required',
    'string.max': 'City cannot exceed 100 characters'
  }),
  state: Joi.string().min(1).max(100).required().messages({
    'string.min': 'State is required',
    'string.max': 'State cannot exceed 100 characters'
  }),
  pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'PIN code must be 6 digits',
    'any.required': 'PIN code is required'
  }),
  country: Joi.string().max(100).default('India'),
  source: Joi.string().valid('referral', 'website', 'social', 'campaign', 'lead', 'direct', 'other').optional(),
  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  assignedAgentId: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Invalid agent ID format',
    'string.length': 'Invalid agent ID length'
  })
};

// Individual client validation
const individualClientValidation = Joi.object({
  clientType: Joi.string().valid('individual').required(),
  firstName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'First name is required',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Last name is required',
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  dob: Joi.date().max('now').required().messages({
    'date.max': 'Date of birth must be in the past',
    'any.required': 'Date of birth is required'
  }),
  gender: Joi.string().valid('male', 'female', 'other').required().messages({
    'any.only': 'Gender must be male, female, or other',
    'any.required': 'Gender is required'
  }),
  panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required().messages({
    'string.pattern.base': 'Invalid PAN number format (e.g., ABCDE1234F)',
    'any.required': 'PAN number is required'
  }),
  aadharNumber: Joi.string().pattern(/^\d{4}\s?\d{4}\s?\d{4}$/).optional().messages({
    'string.pattern.base': 'Invalid Aadhar number format'
  }),
  occupation: Joi.string().max(100).optional(),
  annualIncome: Joi.number().positive().optional().messages({
    'number.positive': 'Annual income must be positive'
  }),
  maritalStatus: Joi.string().valid('single', 'married', 'divorced', 'widowed').optional(),
  nomineeName: Joi.string().max(100).optional(),
  nomineeRelation: Joi.string().max(50).optional(),
  nomineeContact: Joi.string().pattern(/^\d{10}$/).optional().messages({
    'string.pattern.base': 'Nominee contact must be 10 digits'
  }),
  ...commonFields
});

// Corporate client validation
const corporateClientValidation = Joi.object({
  clientType: Joi.string().valid('corporate').required(),
  companyName: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Company name is required',
    'string.max': 'Company name cannot exceed 200 characters'
  }),
  registrationNo: Joi.string().min(1).required().messages({
    'string.min': 'Registration number is required'
  }),
  gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional().messages({
    'string.pattern.base': 'Invalid GST number format'
  }),
  industry: Joi.string().valid('IT', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Education', 'Hospitality', 'Construction', 'Transport', 'Agriculture', 'Other').required(),
  employeeCount: Joi.number().positive().required().messages({
    'number.positive': 'Employee count must be positive',
    'any.required': 'Employee count is required'
  }),
  turnover: Joi.number().positive().optional().messages({
    'number.positive': 'Turnover must be positive'
  }),
  yearEstablished: Joi.number().min(1900).max(new Date().getFullYear()).optional().messages({
    'number.min': 'Year established must be after 1900',
    'number.max': 'Year established cannot be in the future'
  }),
  website: Joi.string().uri().optional().messages({
    'string.uri': 'Please provide a valid website URL'
  }),
  contactPersonName: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Contact person name is required',
    'string.max': 'Contact person name cannot exceed 100 characters'
  }),
  contactPersonDesignation: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Contact person designation is required',
    'string.max': 'Contact person designation cannot exceed 100 characters'
  }),
  contactPersonEmail: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid contact person email',
    'any.required': 'Contact person email is required'
  }),
  contactPersonPhone: Joi.string().pattern(/^\d{10}$/).required().messages({
    'string.pattern.base': 'Contact person phone must be 10 digits',
    'any.required': 'Contact person phone is required'
  }),
  ...commonFields
});

// Group client validation
const groupClientValidation = Joi.object({
  clientType: Joi.string().valid('group').required(),
  groupName: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Group name is required',
    'string.max': 'Group name cannot exceed 200 characters'
  }),
  groupType: Joi.string().valid('family', 'association', 'trust', 'society', 'community', 'other').required(),
  memberCount: Joi.number().min(2).required().messages({
    'number.min': 'Member count must be at least 2',
    'any.required': 'Member count is required'
  }),
  primaryContactName: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Primary contact name is required',
    'string.max': 'Primary contact name cannot exceed 100 characters'
  }),
  relationshipWithGroup: Joi.string().max(100).optional(),
  registrationID: Joi.string().optional(),
  groupFormationDate: Joi.date().max('now').optional().messages({
    'date.max': 'Group formation date cannot be in the future'
  }),
  groupCategory: Joi.string().valid('general', 'religious', 'educational', 'professional', 'social', 'other').optional(),
  groupPurpose: Joi.string().max(500).optional().messages({
    'string.max': 'Group purpose cannot exceed 500 characters'
  }),
  ...commonFields
});

// Main client validation (discriminated union)
const clientValidation = Joi.alternatives().try(
  individualClientValidation,
  corporateClientValidation,
  groupClientValidation
).required();

// Update client validation (all fields optional except clientType)
const updateClientValidation = Joi.alternatives().try(
  individualClientValidation.fork(Object.keys(individualClientValidation.describe().keys), (schema) => schema.optional()),
  corporateClientValidation.fork(Object.keys(corporateClientValidation.describe().keys), (schema) => schema.optional()),
  groupClientValidation.fork(Object.keys(groupClientValidation.describe().keys), (schema) => schema.optional())
).required();

// Document validation
const documentValidation = Joi.object({
  documentType: Joi.string().valid('pan', 'aadhaar', 'idProof', 'addressProof', 'gst', 'registration').required().messages({
    'any.only': 'Invalid document type',
    'any.required': 'Document type is required'
  })
});

// Query parameters validation
const queryValidation = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  type: Joi.string().valid('all', 'individual', 'corporate', 'group').default('all'),
  status: Joi.string().valid('All', 'Active', 'Inactive', 'Pending').default('All'),
  sortField: Joi.string().valid('name', 'createdAt', 'status', 'type').default('createdAt'),
  sortDirection: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  clientValidation,
  updateClientValidation,
  documentValidation,
  queryValidation
};
