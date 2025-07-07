
const Joi = require('joi');

// Individual client validation schema
const individualDataSchema = Joi.object({
  firstName: Joi.string().required().trim().max(50),
  lastName: Joi.string().required().trim().max(50),
  dob: Joi.date().required().max('now'),
  gender: Joi.string().required().valid('male', 'female', 'other'),
  panNumber: Joi.string().required().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  aadharNumber: Joi.string().optional().pattern(/^\d{4}\s?\d{4}\s?\d{4}$/),
  occupation: Joi.string().optional().trim().max(100),
  annualIncome: Joi.number().optional().min(0),
  maritalStatus: Joi.string().optional().valid('single', 'married', 'divorced', 'widowed'),
  nomineeName: Joi.string().optional().trim().max(100),
  nomineeRelation: Joi.string().optional().trim().max(50),
  nomineeContact: Joi.string().optional().pattern(/^\d{10}$/)
});

// Corporate client validation schema
const corporateDataSchema = Joi.object({
  companyName: Joi.string().required().trim().max(200),
  registrationNo: Joi.string().required().trim(),
  gstNumber: Joi.string().optional().uppercase().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
  industry: Joi.string().required().valid('IT', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Education', 'Hospitality', 'Construction', 'Transport', 'Agriculture', 'Other'),
  employeeCount: Joi.number().required().min(1),
  turnover: Joi.number().optional().min(0),
  yearEstablished: Joi.number().optional().min(1900).max(new Date().getFullYear()),
  website: Joi.string().optional().pattern(/^https?:\/\/.+/),
  contactPersonName: Joi.string().required().trim().max(100),
  contactPersonDesignation: Joi.string().required().trim().max(100),
  contactPersonEmail: Joi.string().required().email(),
  contactPersonPhone: Joi.string().required().pattern(/^\d{10}$/)
});

// Group client validation schema
const groupDataSchema = Joi.object({
  groupName: Joi.string().required().trim().max(200),
  groupType: Joi.string().required().valid('family', 'association', 'trust', 'society', 'community', 'other'),
  memberCount: Joi.number().required().min(2),
  primaryContactName: Joi.string().required().trim().max(100),
  relationshipWithGroup: Joi.string().optional().trim().max(100),
  registrationID: Joi.string().optional().trim(),
  groupFormationDate: Joi.date().optional(),
  groupCategory: Joi.string().optional().valid('general', 'religious', 'educational', 'professional', 'social', 'other'),
  groupPurpose: Joi.string().optional().trim().max(500)
});

// Communication preferences schema
const communicationPreferencesSchema = Joi.object({
  email: Joi.object({
    offers: Joi.boolean().default(true),
    newsletters: Joi.boolean().default(true),
    reminders: Joi.boolean().default(true),
    birthday: Joi.boolean().default(true),
    anniversary: Joi.boolean().default(true)
  }).optional(),
  whatsapp: Joi.object({
    offers: Joi.boolean().default(true),
    newsletters: Joi.boolean().default(true),
    reminders: Joi.boolean().default(true),
    birthday: Joi.boolean().default(true),
    anniversary: Joi.boolean().default(true)
  }).optional(),
  sms: Joi.object({
    offers: Joi.boolean().default(false),
    newsletters: Joi.boolean().default(false),
    reminders: Joi.boolean().default(true),
    birthday: Joi.boolean().default(false),
    anniversary: Joi.boolean().default(false)
  }).optional()
});

// Main client validation schema
const clientValidation = Joi.object({
  clientType: Joi.string().required().valid('individual', 'corporate', 'group'),
  email: Joi.string().required().email().lowercase(),
  phone: Joi.string().required().pattern(/^\d{10}$/),
  altPhone: Joi.string().optional().pattern(/^\d{10}$/),
  address: Joi.string().required().trim().max(500),
  city: Joi.string().required().trim().max(100),
  state: Joi.string().required().trim().max(100),
  pincode: Joi.string().required().pattern(/^\d{6}$/),
  country: Joi.string().optional().trim().max(100).default('India'),
  status: Joi.string().optional().valid('Active', 'Inactive', 'Pending').default('Active'),
  source: Joi.string().optional().valid('referral', 'website', 'social', 'campaign', 'lead', 'direct', 'other').default('direct'),
  notes: Joi.string().optional().trim().max(1000),
  assignedAgentId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  
  // Type-specific data - conditional validation
  individualData: Joi.when('clientType', {
    is: 'individual',
    then: individualDataSchema.required(),
    otherwise: Joi.forbidden()
  }),
  
  corporateData: Joi.when('clientType', {
    is: 'corporate',
    then: corporateDataSchema.required(),
    otherwise: Joi.forbidden()
  }),
  
  groupData: Joi.when('clientType', {
    is: 'group',
    then: groupDataSchema.required(),
    otherwise: Joi.forbidden()
  }),
  
  communicationPreferences: communicationPreferencesSchema.optional()
});

// Update client validation (all fields optional except critical ones)
const updateClientValidation = Joi.object({
  email: Joi.string().optional().email().lowercase(),
  phone: Joi.string().optional().pattern(/^\d{10}$/),
  altPhone: Joi.string().optional().pattern(/^\d{10}$/),
  address: Joi.string().optional().trim().max(500),
  city: Joi.string().optional().trim().max(100),
  state: Joi.string().optional().trim().max(100),
  pincode: Joi.string().optional().pattern(/^\d{6}$/),
  country: Joi.string().optional().trim().max(100),
  status: Joi.string().optional().valid('Active', 'Inactive', 'Pending'),
  source: Joi.string().optional().valid('referral', 'website', 'social', 'campaign', 'lead', 'direct', 'other'),
  notes: Joi.string().optional().trim().max(1000),
  assignedAgentId: Joi.string().optional().regex(/^[0-9a-fA-F]{24}$/),
  
  // Type-specific updates
  individualData: Joi.object({
    firstName: Joi.string().optional().trim().max(50),
    lastName: Joi.string().optional().trim().max(50),
    dob: Joi.date().optional().max('now'),
    gender: Joi.string().optional().valid('male', 'female', 'other'),
    panNumber: Joi.string().optional().uppercase().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
    aadharNumber: Joi.string().optional().pattern(/^\d{4}\s?\d{4}\s?\d{4}$/),
    occupation: Joi.string().optional().trim().max(100),
    annualIncome: Joi.number().optional().min(0),
    maritalStatus: Joi.string().optional().valid('single', 'married', 'divorced', 'widowed'),
    nomineeName: Joi.string().optional().trim().max(100),
    nomineeRelation: Joi.string().optional().trim().max(50),
    nomineeContact: Joi.string().optional().pattern(/^\d{10}$/)
  }).optional(),
  
  corporateData: Joi.object({
    companyName: Joi.string().optional().trim().max(200),
    registrationNo: Joi.string().optional().trim(),
    gstNumber: Joi.string().optional().uppercase().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
    industry: Joi.string().optional().valid('IT', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Education', 'Hospitality', 'Construction', 'Transport', 'Agriculture', 'Other'),
    employeeCount: Joi.number().optional().min(1),
    turnover: Joi.number().optional().min(0),
    yearEstablished: Joi.number().optional().min(1900).max(new Date().getFullYear()),
    website: Joi.string().optional().pattern(/^https?:\/\/.+/),
    contactPersonName: Joi.string().optional().trim().max(100),
    contactPersonDesignation: Joi.string().optional().trim().max(100),
    contactPersonEmail: Joi.string().optional().email(),
    contactPersonPhone: Joi.string().optional().pattern(/^\d{10}$/)
  }).optional(),
  
  groupData: Joi.object({
    groupName: Joi.string().optional().trim().max(200),
    groupType: Joi.string().optional().valid('family', 'association', 'trust', 'society', 'community', 'other'),
    memberCount: Joi.number().optional().min(2),
    primaryContactName: Joi.string().optional().trim().max(100),
    relationshipWithGroup: Joi.string().optional().trim().max(100),
    registrationID: Joi.string().optional().trim(),
    groupFormationDate: Joi.date().optional(),
    groupCategory: Joi.string().optional().valid('general', 'religious', 'educational', 'professional', 'social', 'other'),
    groupPurpose: Joi.string().optional().trim().max(500)
  }).optional(),
  
  communicationPreferences: communicationPreferencesSchema.optional()
});

// Document validation schema
const documentValidation = Joi.object({
  documentType: Joi.string().required().valid('pan', 'aadhaar', 'idProof', 'addressProof', 'gst', 'registration'),
  name: Joi.string().optional().trim().max(100)
});

// Export validation schemas
module.exports = {
  clientValidation,
  updateClientValidation,
  documentValidation
};
