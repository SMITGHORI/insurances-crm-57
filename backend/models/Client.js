
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Individual client sub-schema
const individualSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  dob: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        return date < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  panNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    index: true
  },
  aadharNumber: {
    type: String,
    match: /^\d{4}\s?\d{4}\s?\d{4}$/,
    sparse: true
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: 100
  },
  annualIncome: {
    type: Number,
    min: 0
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed']
  },
  nomineeName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  nomineeRelation: {
    type: String,
    trim: true,
    maxlength: 50
  },
  nomineeContact: {
    type: String,
    match: /^\d{10}$/
  }
});

// Corporate client sub-schema
const corporateSchema = new Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  registrationNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  gstNumber: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  },
  industry: {
    type: String,
    required: true,
    enum: ['IT', 'Manufacturing', 'Healthcare', 'Finance', 'Retail', 'Education', 'Hospitality', 'Construction', 'Transport', 'Agriculture', 'Other']
  },
  employeeCount: {
    type: Number,
    required: true,
    min: 1
  },
  turnover: {
    type: Number,
    min: 0
  },
  yearEstablished: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  website: {
    type: String,
    match: /^https?:\/\/.+/
  },
  contactPersonName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  contactPersonDesignation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  contactPersonEmail: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  contactPersonPhone: {
    type: String,
    required: true,
    match: /^\d{10}$/
  }
});

// Group client sub-schema
const groupSchema = new Schema({
  groupName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  groupType: {
    type: String,
    required: true,
    enum: ['family', 'association', 'trust', 'society', 'community', 'other']
  },
  memberCount: {
    type: Number,
    required: true,
    min: 2
  },
  primaryContactName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  relationshipWithGroup: {
    type: String,
    trim: true,
    maxlength: 100
  },
  registrationID: {
    type: String,
    trim: true,
    sparse: true
  },
  groupFormationDate: {
    type: Date
  },
  groupCategory: {
    type: String,
    enum: ['general', 'religious', 'educational', 'professional', 'social', 'other']
  },
  groupPurpose: {
    type: String,
    trim: true,
    maxlength: 500
  }
});

// Document sub-schema
const documentSchema = new Schema({
  documentType: {
    type: String,
    required: true,
    enum: ['pan', 'aadhaar', 'idProof', 'addressProof', 'gst', 'registration']
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Main client schema
const clientSchema = new Schema({
  clientId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  clientType: {
    type: String,
    required: true,
    enum: ['individual', 'corporate', 'group']
  },
  // Common fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    index: true
  },
  phone: {
    type: String,
    required: true,
    match: /^\d{10}$/,
    index: true
  },
  altPhone: {
    type: String,
    match: /^\d{10}$/
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  pincode: {
    type: String,
    required: true,
    match: /^\d{6}$/
  },
  country: {
    type: String,
    default: 'India',
    trim: true,
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active',
    index: true
  },
  source: {
    type: String,
    enum: ['referral', 'website', 'social', 'campaign', 'lead', 'direct', 'other'],
    default: 'direct'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  assignedAgentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Type-specific data
  individualData: {
    type: individualSchema,
    required: function() { return this.clientType === 'individual'; }
  },
  corporateData: {
    type: corporateSchema,
    required: function() { return this.clientType === 'corporate'; }
  },
  groupData: {
    type: groupSchema,
    required: function() { return this.clientType === 'group'; }
  },
  // Documents
  documents: [documentSchema],
  // Policies count (for quick access)
  policiesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // Audit fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
clientSchema.index({ clientType: 1, status: 1 });
clientSchema.index({ assignedAgentId: 1, status: 1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ email: 1, phone: 1 });

// Text index for search functionality
clientSchema.index({
  clientId: 'text',
  email: 'text',
  'individualData.firstName': 'text',
  'individualData.lastName': 'text',
  'corporateData.companyName': 'text',
  'groupData.groupName': 'text'
});

// Virtual for display name
clientSchema.virtual('displayName').get(function() {
  switch (this.clientType) {
    case 'individual':
      return `${this.individualData?.firstName || ''} ${this.individualData?.lastName || ''}`.trim();
    case 'corporate':
      return this.corporateData?.companyName || 'Corporate Client';
    case 'group':
      return this.groupData?.groupName || 'Group Client';
    default:
      return 'Unknown Client';
  }
});

// Pre-save middleware to generate clientId
clientSchema.pre('save', async function(next) {
  if (this.isNew && !this.clientId) {
    const count = await this.constructor.countDocuments();
    this.clientId = `CL${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware for audit trail
clientSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.modifiedBy; // Set by middleware
  }
  next();
});

// Instance methods
clientSchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

clientSchema.methods.removeDocument = function(documentId) {
  this.documents.id(documentId).remove();
  return this.save();
};

clientSchema.methods.updatePoliciesCount = async function() {
  // This would typically query the Policy model
  // const count = await mongoose.model('Policy').countDocuments({ clientId: this._id });
  // this.policiesCount = count;
  // return this.save();
};

// Static methods
clientSchema.statics.findByAgent = function(agentId, filters = {}) {
  return this.find({ assignedAgentId: agentId, ...filters });
};

clientSchema.statics.searchClients = function(query, filters = {}) {
  return this.find({
    $text: { $search: query },
    ...filters
  }).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Client', clientSchema);
