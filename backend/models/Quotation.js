
const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  quoteId: {
    type: String,
    unique: true,
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  insuranceType: {
    type: String,
    enum: ['Health Insurance', 'Life Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance', 'Business Insurance', 'Group Health Insurance'],
    required: true
  },
  insuranceCompany: {
    type: String,
    required: true,
    maxlength: 100
  },
  products: [{
    type: String,
    required: true,
    maxlength: 100
  }],
  sumInsured: {
    type: Number,
    required: true,
    min: 0,
    max: 100000000
  },
  premium: {
    type: Number,
    required: true,
    min: 0,
    max: 10000000
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agentName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  sentDate: {
    type: Date
  },
  viewedAt: {
    type: Date
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  convertedToPolicy: {
    type: String
  },
  validUntil: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  customFields: {
    type: Map,
    of: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: true
});

// Indexes for better query performance
quotationSchema.index({ quoteId: 1 });
quotationSchema.index({ clientId: 1 });
quotationSchema.index({ agentId: 1 });
quotationSchema.index({ status: 1 });
quotationSchema.index({ insuranceType: 1 });
quotationSchema.index({ insuranceCompany: 1 });
quotationSchema.index({ validUntil: 1 });
quotationSchema.index({ sentDate: 1 });
quotationSchema.index({ createdAt: -1 });
quotationSchema.index({ updatedAt: -1 });

// Compound indexes
quotationSchema.index({ status: 1, agentId: 1 });
quotationSchema.index({ insuranceType: 1, status: 1 });
quotationSchema.index({ validUntil: 1, status: 1 });
quotationSchema.index({ agentId: 1, createdAt: -1 });

// Text index for search functionality
quotationSchema.index({
  quoteId: 'text',
  clientName: 'text',
  insuranceCompany: 'text',
  notes: 'text'
});

// Pre-save middleware to generate quoteId
quotationSchema.pre('save', async function(next) {
  if (this.isNew && !this.quoteId) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.quoteId = `QT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for checking if quotation is expired
quotationSchema.virtual('isExpired').get(function() {
  return this.validUntil < new Date() && this.status !== 'accepted';
});

// Methods
quotationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.emailSent = true;
  this.sentDate = new Date();
  return this.save();
};

quotationSchema.methods.markAsViewed = function() {
  if (this.status === 'sent') {
    this.status = 'viewed';
    this.viewedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

quotationSchema.methods.markAsAccepted = function() {
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

quotationSchema.methods.markAsRejected = function(reason) {
  this.status = 'rejected';
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Static methods
quotationSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

quotationSchema.statics.findByAgent = function(agentId) {
  return this.find({ agentId });
};

quotationSchema.statics.findExpired = function() {
  return this.find({
    validUntil: { $lt: new Date() },
    status: { $nin: ['accepted', 'rejected'] }
  });
};

quotationSchema.statics.findByClient = function(clientId) {
  return this.find({ clientId });
};

module.exports = mongoose.model('Quotation', quotationSchema);
