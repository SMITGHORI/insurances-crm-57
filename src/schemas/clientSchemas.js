
import { z } from 'zod';

/**
 * Validation schemas for client data
 * Compatible with MongoDB document structure
 */

// Common fields schema
const commonFieldsSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  altPhone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  country: z.string().default('India'),
  source: z.enum(['referral', 'website', 'social', 'campaign', 'lead', 'direct', 'other']).optional(),
  notes: z.string().optional(),
  assignedAgentId: z.string().optional(),
});

// Individual client schema
const individualClientSchema = z.object({
  clientType: z.literal('individual'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
  aadharNumber: z.string().regex(/^\d{4}\s?\d{4}\s?\d{4}$/, 'Invalid Aadhar number format').optional(),
  occupation: z.string().optional(),
  annualIncome: z.number().positive().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  nomineeName: z.string().optional(),
  nomineeRelation: z.string().optional(),
  nomineeContact: z.string().optional(),
});

// Corporate client schema
const corporateClientSchema = z.object({
  clientType: z.literal('corporate'),
  companyName: z.string().min(1, 'Company name is required'),
  registrationNo: z.string().min(1, 'Registration number is required'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format').optional(),
  industry: z.enum(['IT', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Education', 'Hospitality', 'Construction', 'Transport', 'Agriculture', 'Other']),
  employeeCount: z.number().positive('Employee count must be positive'),
  turnover: z.number().positive().optional(),
  yearEstablished: z.number().min(1900).max(new Date().getFullYear()).optional(),
  website: z.string().url().optional().or(z.literal('')),
  contactPersonName: z.string().min(1, 'Contact person name is required'),
  contactPersonDesignation: z.string().min(1, 'Contact person designation is required'),
  contactPersonEmail: z.string().email('Invalid contact person email'),
  contactPersonPhone: z.string().min(10, 'Contact person phone must be at least 10 digits'),
});

// Group client schema
const groupClientSchema = z.object({
  clientType: z.literal('group'),
  groupName: z.string().min(1, 'Group name is required'),
  groupType: z.enum(['family', 'association', 'trust', 'society', 'community', 'other']),
  memberCount: z.number().positive('Member count must be positive'),
  primaryContactName: z.string().min(1, 'Primary contact name is required'),
  relationshipWithGroup: z.string().optional(),
  registrationID: z.string().optional(),
  groupFormationDate: z.string().optional(),
  groupCategory: z.enum(['general', 'religious', 'educational', 'professional', 'social', 'other']).optional(),
  groupPurpose: z.string().optional(),
});

// Main client schema (discriminated union)
export const clientSchema = z.discriminatedUnion('clientType', [
  individualClientSchema.merge(commonFieldsSchema),
  corporateClientSchema.merge(commonFieldsSchema),
  groupClientSchema.merge(commonFieldsSchema),
]);

// Client update schema (for existing clients) - Fix the .partial() issue
export const clientUpdateSchema = z.discriminatedUnion('clientType', [
  individualClientSchema.partial().required({ clientType: true }).merge(commonFieldsSchema.partial()),
  corporateClientSchema.partial().required({ clientType: true }).merge(commonFieldsSchema.partial()),
  groupClientSchema.partial().required({ clientType: true }).merge(commonFieldsSchema.partial()),
]).extend({
  _id: z.string().optional(), // MongoDB ObjectId
  clientId: z.string().optional(), // Custom client ID
  status: z.enum(['Active', 'Inactive', 'Pending']).optional(),
  policies: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Document upload schema
export const documentSchema = z.object({
  documentType: z.enum(['pan', 'aadhaar', 'idProof', 'addressProof', 'gst', 'registration']),
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
});

// Query parameters schema for filtering
export const clientQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.enum(['all', 'individual', 'corporate', 'group']).default('all'),
  status: z.enum(['All', 'Active', 'Inactive', 'Pending']).default('All'),
  sortField: z.enum(['name', 'createdAt', 'status', 'type']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

// Helper function to validate client data
export const validateClientData = (data) => {
  try {
    return {
      success: true,
      data: clientSchema.parse(data),
      errors: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors,
    };
  }
};

// Helper function to get client name based on type
export const getClientName = (clientData) => {
  switch (clientData.clientType) {
    case 'individual':
      return `${clientData.firstName} ${clientData.lastName}`;
    case 'corporate':
      return clientData.companyName;
    case 'group':
      return clientData.groupName;
    default:
      return 'Unknown Client';
  }
};
