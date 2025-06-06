
const mongoose = require('mongoose');

/**
 * Claim Document Schema
 * Represents uploaded documents for a claim
 */
const claimDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    max: 10485760 // 10MB in bytes
  },
  mimeType: {
    type: String,
    required: true,
    enum: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'incident_report',
      'police_report',
      'medical_report',
      'repair_estimate',
      'receipt',
      'photo_evidence',
      'witness_statement',
      'insurance_form',
      'other'
    ]
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Claim Note Schema
 * Represents notes added to a claim
 */
const claimNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['internal', 'client_communication', 'system'],
    default: 'internal'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isVisible: {
    type: Boolean,
    default: true
  }
});

/**
 * Claim Timeline Event Schema
 * Tracks important events in claim processing
 */
const timelineEventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: [
      'reported',
      'under_review',
      'pending',
      'approved',
      'rejected',
      'settled',
      'closed',
      'document_uploaded',
      'note_added',
      'assigned',
      'amount_updated'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

/**
 * Main Claim Schema
 * Represents an insurance claim in the system
 */
const claimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^CLM-\d{4}-\d{3,6}$/
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true,
    index: true
  },
  claimType: {
    type: String,
    required: true,
    enum: [
      'Auto',
      'Home',
      'Life',
      'Health',
      'Travel',
      'Business',
      'Disability',
      'Property',
      'Liability',
      'Workers Compensation'
    ],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Reported',
      'Under Review',
      'Pending',
      'Approved',
      'Rejected',
      'Settled',
      'Closed',
      'Deleted'
    ],
    default: 'Reported',
    index: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
    index: true
  },
  claimAmount: {
    type: Number,
    required: true,
    min: 0,
    max: 10000000, // 10 million max
    index: true
  },
  approvedAmount: {
    type: Number,
    min: 0,
    default: 0,
    validate: {
      validator: function(value) {
        return value <= this.claimAmount;
      },
      message: 'Approved amount cannot exceed claim amount'
    }
  },
  deductible: {
    type: Number,
    min: 0,
    default: 0
  },
  incidentDate: {
    type: Date,
    required: true,
    index: true,
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Incident date cannot be in the future'
    }
  },
  reportedDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  estimatedSettlement: {
    type: Date,
    index: true
  },
  actualSettlement: {
    type: Date,
    index: true
  },
  
  // Location information
  incidentLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact information
  contactDetails: {
    primaryContact: String,
    phoneNumber: String,
    email: String,
    alternateContact: String
  },
  
  // Third party information (for liability claims)
  thirdParty: {
    name: String,
    insuranceCompany: String,
    policyNumber: String,
    contactNumber: String
  },
  
  // Financial details
  financial: {
    totalIncurred: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    outstanding: {
      type: Number,
      default: 0
    },
    reserves: {
      type: Number,
      default: 0
    }
  },
  
  // Risk assessment
  riskFactors: {
    fraudIndicators: [String],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    investigationRequired: {
      type: Boolean,
      default: false
    }
  },
  
  // Relationships
  documents: [claimDocumentSchema],
  notes: [claimNoteSchema],
  timeline: [timelineEventSchema],
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'claims'
});

// Compound indexes for complex queries
claimSchema.index({ clientId: 1, status: 1 });
claimSchema.index({ policyId: 1, status: 1 });
claimSchema.index({ assignedTo: 1, status: 1 });
claimSchema.index({ claimType: 1, status: 1 });
claimSchema.index({ reportedDate: -1, status: 1 });
claimSchema.index({ incidentDate: -1, claimAmount: -1 });
claimSchema.index({ isDeleted: 1, status: 1, assignedTo: 1 });

// Text index for search functionality
claimSchema.index({
  claimNumber: 'text',
  description: 'text',
  'contactDetails.primaryContact': 'text'
}, {
  weights: {
    claimNumber: 10,
    description: 5,
    'contactDetails.primaryContact': 3
  }
});

// Virtual for claim age (days since reported)
claimSchema.virtual('claimAge').get(function() {
  return Math.floor((Date.now() - this.reportedDate) / (1000 * 60 * 60 * 24));
});

// Virtual for outstanding amount
claimSchema.virtual('outstandingAmount').get(function() {
  return this.approvedAmount - this.financial.totalPaid;
});

// Pre-save middleware to generate claim number
claimSchema.pre('save', async function(next) {
  if (this.isNew && !this.claimNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      claimNumber: new RegExp(`^CLM-${year}-`)
    });
    this.claimNumber = `CLM-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Pre-save middleware to update timeline
claimSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      event: `Status changed to ${this.status}`,
      description: `Claim status updated`,
      status: this.status.toLowerCase().replace(' ', '_'),
      createdBy: this.updatedBy || this.createdBy,
      timestamp: new Date()
    });
  }
  next();
});

// Method to add timeline event
claimSchema.methods.addTimelineEvent = function(event, description, status, createdBy, metadata = {}) {
  this.timeline.push({
    event,
    description,
    status,
    createdBy,
    metadata,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add note
claimSchema.methods.addNote = function(content, type, priority, createdBy) {
  this.notes.push({
    content,
    type: type || 'internal',
    priority: priority || 'normal',
    createdBy,
    createdAt: new Date()
  });
  return this.save();
};

// Method to soft delete
claimSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.status = 'Deleted';
  return this.save();
};

// Static method to find non-deleted claims
claimSchema.statics.findActive = function(conditions = {}) {
  return this.find({ ...conditions, isDeleted: { $ne: true } });
};

// Static method for advanced search
claimSchema.statics.searchClaims = function(query, options = {}) {
  const searchConditions = {
    $and: [
      { isDeleted: { $ne: true } },
      {
        $or: [
          { claimNumber: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') },
          { 'contactDetails.primaryContact': new RegExp(query, 'i') }
        ]
      }
    ]
  };

  if (options.assignedTo) {
    searchConditions.$and.push({ assignedTo: options.assignedTo });
  }

  return this.find(searchConditions)
    .populate('clientId', 'firstName lastName email')
    .populate('policyId', 'policyNumber policyType')
    .populate('assignedTo', 'firstName lastName email')
    .limit(options.limit || 20)
    .sort({ createdAt: -1 });
};

// Export the model
module.exports = mongoose.model('Claim', claimSchema);
