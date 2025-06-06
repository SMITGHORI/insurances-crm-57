
const mongoose = require('mongoose');

const claimTimelineSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['Filed', 'Under Review', 'Approved', 'Rejected', 'Settled', 'Closed', 'Document Added', 'Status Updated']
  },
  by: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const claimDocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['medical_report', 'police_report', 'damage_assessment', 'receipt', 'invoice', 'photo', 'other']
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
});

const claimNoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['internal', 'client', 'system'],
    default: 'internal'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
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

const claimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  insuranceCompanyClaimId: {
    type: String,
    sparse: true,
    index: true
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
    enum: ['Health', 'Life', 'Vehicle', 'Property', 'Travel', 'Disability'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Submitted', 'Under Review', 'Pending Documentation', 'Under Investigation', 'Approved', 'Rejected', 'Settled', 'Closed'],
    default: 'Draft',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true
  },
  claimAmount: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  approvedAmount: {
    type: Number,
    min: 0,
    default: null
  },
  settledAmount: {
    type: Number,
    min: 0,
    default: null
  },
  deductibleAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  incidentDate: {
    type: Date,
    required: true,
    index: true
  },
  reportedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  incidentLocation: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    index: true
  },
  investigatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null
  },
  estimatedSettlement: {
    type: Date,
    index: true
  },
  actualSettlement: {
    type: Date,
    index: true
  },
  documents: [claimDocumentSchema],
  notes: [claimNoteSchema],
  timeline: [claimTimelineSchema],
  tags: [{
    type: String,
    maxlength: 50
  }],
  fraudIndicators: [{
    type: String,
    reason: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    detectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  communicationHistory: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'sms', 'letter', 'meeting'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    subject: String,
    content: String,
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [String]
  }],
  paymentDetails: {
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'check', 'card', 'cash'],
      default: null
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String,
      swiftCode: String
    },
    paymentReference: String,
    paymentDate: Date,
    transactionId: String
  },
  relatedClaims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }],
  renewalEligible: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'import'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String,
    referenceNumber: String,
    externalSystemId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
claimSchema.index({ clientId: 1, status: 1 });
claimSchema.index({ assignedTo: 1, status: 1 });
claimSchema.index({ policyId: 1, claimType: 1 });
claimSchema.index({ incidentDate: 1, reportedDate: 1 });
claimSchema.index({ claimAmount: 1, status: 1 });
claimSchema.index({ createdAt: -1 });
claimSchema.index({ updatedAt: -1 });
claimSchema.index({ 
  claimNumber: 'text', 
  description: 'text',
  'incidentLocation.address': 'text'
}, {
  weights: {
    claimNumber: 10,
    description: 5,
    'incidentLocation.address': 1
  }
});

// Virtual for claim age
claimSchema.virtual('claimAge').get(function() {
  return Math.floor((Date.now() - this.reportedDate) / (1000 * 60 * 60 * 24));
});

// Virtual for processing time
claimSchema.virtual('processingTime').get(function() {
  if (this.actualSettlement) {
    return Math.floor((this.actualSettlement - this.reportedDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for total documents count
claimSchema.virtual('documentsCount').get(function() {
  return this.documents.length;
});

// Pre-save middleware
claimSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastModifiedBy = this.modifiedBy;
  }
  next();
});

// Post-save middleware to update timeline
claimSchema.post('save', function(doc, next) {
  if (this.isNew) {
    this.timeline.push({
      action: 'Filed',
      by: this.createdBy.toString(),
      timestamp: new Date(),
      details: 'Claim initially filed'
    });
  }
  next();
});

// Static methods
claimSchema.statics.findByClaimNumber = function(claimNumber) {
  return this.findOne({ claimNumber: claimNumber });
};

claimSchema.statics.findByStatus = function(status) {
  return this.find({ status: status, isActive: true });
};

claimSchema.statics.findByAgent = function(agentId) {
  return this.find({ assignedTo: agentId, isActive: true });
};

claimSchema.statics.findByClient = function(clientId) {
  return this.find({ clientId: clientId, isActive: true });
};

claimSchema.statics.findByPolicy = function(policyId) {
  return this.find({ policyId: policyId, isActive: true });
};

claimSchema.statics.findExpiring = function(days = 30) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  
  return this.find({
    estimatedSettlement: { $lte: targetDate },
    status: { $in: ['Under Review', 'Pending Documentation', 'Under Investigation'] },
    isActive: true
  });
};

// Instance methods
claimSchema.methods.addNote = function(content, type, createdBy, priority = 'normal') {
  this.notes.push({
    content,
    type,
    createdBy,
    priority
  });
  
  this.timeline.push({
    action: 'Note Added',
    by: createdBy.toString(),
    timestamp: new Date(),
    details: `${type} note added`
  });
  
  return this.save();
};

claimSchema.methods.updateStatus = function(newStatus, updatedBy, reason = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  this.lastModifiedBy = updatedBy;
  
  this.timeline.push({
    action: 'Status Updated',
    by: updatedBy.toString(),
    timestamp: new Date(),
    details: reason || `Status changed from ${oldStatus} to ${newStatus}`
  });
  
  return this.save();
};

claimSchema.methods.addDocument = function(documentData, uploadedBy) {
  this.documents.push({
    ...documentData,
    uploadedBy
  });
  
  this.timeline.push({
    action: 'Document Added',
    by: uploadedBy.toString(),
    timestamp: new Date(),
    details: `Document ${documentData.originalName} uploaded`
  });
  
  return this.save();
};

claimSchema.methods.approveClaim = function(approvedAmount, approvedBy, reason = '') {
  this.status = 'Approved';
  this.approvedAmount = approvedAmount;
  this.lastModifiedBy = approvedBy;
  
  this.timeline.push({
    action: 'Approved',
    by: approvedBy.toString(),
    timestamp: new Date(),
    details: reason || `Claim approved for amount: ${approvedAmount}`
  });
  
  return this.save();
};

claimSchema.methods.rejectClaim = function(rejectedBy, reason) {
  this.status = 'Rejected';
  this.approvedAmount = 0;
  this.lastModifiedBy = rejectedBy;
  
  this.timeline.push({
    action: 'Rejected',
    by: rejectedBy.toString(),
    timestamp: new Date(),
    details: reason || 'Claim rejected'
  });
  
  return this.save();
};

claimSchema.methods.settleClaim = function(settledAmount, settledBy, paymentDetails, reason = '') {
  this.status = 'Settled';
  this.settledAmount = settledAmount;
  this.actualSettlement = new Date();
  this.lastModifiedBy = settledBy;
  
  if (paymentDetails) {
    this.paymentDetails = { ...this.paymentDetails, ...paymentDetails };
  }
  
  this.timeline.push({
    action: 'Settled',
    by: settledBy.toString(),
    timestamp: new Date(),
    details: reason || `Claim settled for amount: ${settledAmount}`
  });
  
  return this.save();
};

module.exports = mongoose.model('Claim', claimSchema);
