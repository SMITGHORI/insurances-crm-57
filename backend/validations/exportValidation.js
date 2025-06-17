
const Joi = require('joi');

const exportFormats = ['csv', 'excel'];
const exportTypes = ['all', 'filtered', 'selected', 'dateRange'];

const baseExportSchema = {
  format: Joi.string().valid(...exportFormats).required(),
  type: Joi.string().valid(...exportTypes).required(),
  fields: Joi.array().items(Joi.string()).optional(),
  filename: Joi.string().optional()
};

const clientExportValidation = Joi.object({
  ...baseExportSchema,
  filters: Joi.object({
    search: Joi.string().allow('').optional(),
    type: Joi.string().valid('all', 'individual', 'corporate', 'group').optional(),
    status: Joi.string().valid('All', 'Active', 'Inactive', 'Pending').optional(),
    agentId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }).optional(),
  selectedIds: Joi.array().items(Joi.string()).when('type', {
    is: 'selected',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const quotationExportValidation = Joi.object({
  ...baseExportSchema,
  filters: Joi.object({
    search: Joi.string().allow('').optional(),
    status: Joi.string().valid('all', 'draft', 'sent', 'accepted', 'rejected', 'expired').optional(),
    insuranceType: Joi.string().optional(),
    agentId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }).optional(),
  selectedIds: Joi.array().items(Joi.string()).when('type', {
    is: 'selected',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const leadExportValidation = Joi.object({
  ...baseExportSchema,
  filters: Joi.object({
    search: Joi.string().allow('').optional(),
    status: Joi.string().valid('all', 'new', 'contacted', 'qualified', 'converted', 'lost').optional(),
    source: Joi.string().optional(),
    agentId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }).optional(),
  selectedIds: Joi.array().items(Joi.string()).when('type', {
    is: 'selected',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const policyExportValidation = Joi.object({
  ...baseExportSchema,
  filters: Joi.object({
    search: Joi.string().allow('').optional(),
    status: Joi.string().valid('all', 'active', 'expired', 'cancelled', 'pending').optional(),
    insuranceType: Joi.string().optional(),
    agentId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }).optional(),
  selectedIds: Joi.array().items(Joi.string()).when('type', {
    is: 'selected',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const claimExportValidation = Joi.object({
  ...baseExportSchema,
  filters: Joi.object({
    search: Joi.string().allow('').optional(),
    status: Joi.string().valid('all', 'submitted', 'under_review', 'approved', 'rejected', 'paid').optional(),
    claimType: Joi.string().optional(),
    agentId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }).optional(),
  selectedIds: Joi.array().items(Joi.string()).when('type', {
    is: 'selected',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const agentExportValidation = Joi.object({
  ...baseExportSchema,
  filters: Joi.object({
    search: Joi.string().allow('').optional(),
    status: Joi.string().valid('all', 'active', 'inactive', 'suspended').optional(),
    department: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }).optional(),
  selectedIds: Joi.array().items(Joi.string()).when('type', {
    is: 'selected',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

module.exports = {
  clientExportValidation,
  quotationExportValidation,
  leadExportValidation,
  policyExportValidation,
  claimExportValidation,
  agentExportValidation
};
