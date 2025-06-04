
const mongoose = require('mongoose');

/**
 * Premium Schema
 * Represents the premium structure for a policy
 */
const PremiumSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Premium amount is required'],
    min: [0, 'Premium amount must be positive'],
    validate: {
      validator: function(value) {
        return value > 0;
      },
      message: 'Premium amount must be greater than 0'
    }
  },
  frequency: {
    type: String,
    required: [true, 'Premium frequency is required'],
    enum: {
      values: ['monthly', 'quarterly', 'semi-annual', 'annual'],
      message: 'Premium frequency must be monthly, quarterly, semi-annual, or annual'
    }
  },
  nextDueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Next due date must be in the future'
    }
  }
}, { _id: false });

/**
 * Coverage Schema
 * Represents the coverage details for a policy
 */
const CoverageSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Coverage amount is required'],
    min: [0, 'Coverage amount must be positive']
  },
  deductible: {
    type: Number,
    default: 0,
    min: [0, 'Deductible must be positive']
  },
  benefits: [{
    type: String,
    trim: true
  }],
  exclusions: [{
    type: String,
    trim: true
  }]
}, { _id: false });

/**
 * Commission Schema
 * Represents the commission structure for a policy
 */
const CommissionSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: [true, 'Commission rate is required'],
    min: [0, 'Commission rate must be between 0 and 100'],
    max: [100, 'Commission rate must be between 0 and 100']
  },
  amount: {
    type: Number,
    required: [true, 'Commission amount is required'],
    min: [0, 'Commission amount must be positive']
  },
  paid: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || (this.paid && value <= new Date());
      },
      message: 'Paid date cannot be in the future'
    }
  }
}, { _id: false });

/**
 * Document Schema
 * Represents documents attached to a policy
 */
const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document name is required'],
    trim: true,
    maxlength: [255, 'Document name cannot exceed 255 characters']
  },
  type: {
    type: String,
    required: [true, 'Document type is required'],
    enum: {
      values: [
        'policy_document',
        'application_form',
        'medical_report',
        'claim_form',
        'amendment',
        'renewal_document',
        'payment_receipt',
        'beneficiary_form',
        'other'
      ],
      message: 'Invalid document type'
    }
  },
  url: {
    type: String,
    required: [true, 'Document URL is required'],
    trim: true
  },
  size: {
    type: Number,
    min: [0, 'Document size must be positive']
  },
  mimeType: {
    type: String,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Document uploader is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Payment History Schema
 * Represents payment records for a policy
 */
const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount must be positive']
  },
  date: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card', 'online', 'other'],
      message: 'Invalid payment method'
    }
  },
  status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded'],
      message: 'Invalid payment status'
    },
    default: 'completed'
  },
  transactionId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Payment notes cannot exceed 500 characters']
  }
});

/**
 * Renewal History Schema
 * Represents renewal records for a policy
 */
const RenewalSchema = new mongoose.Schema({
  renewalDate: {
    type: Date,
    required: [true, 'Renewal date is required']
  },
  previousEndDate: {
    type: Date,
    required: [true, 'Previous end date is required']
  },
  premium: {
    type: Number,
    required: [true, 'Renewal premium is required'],
    min: [0, 'Renewal premium must be positive']
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Renewal agent is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Renewal notes cannot exceed 500 characters']
  }
});

/**
 * Note Schema
 * Represents notes added to a policy
 */
const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
    maxlength: [1000, 'Note content cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Note creator is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
});

/**
 * Main Policy Schema
 * Represents an insurance policy in the system
 */
const PolicySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: [true, 'Policy number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^POL-\d{4}-\d{3,}$/, 'Policy number must follow format: POL-YYYY-XXX'],
    index: true
  },
  
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
    index: true
  },
  
  type: {
    type: String,
    required: [true, 'Policy type is required'],
    enum: {
      values: ['life', 'health', 'auto', 'home', 'business', 'travel', 'disability', 'other'],
      message: 'Invalid policy type'
    },
    index: true
  },
  
  subType: {
    type: String,
    trim: true,
    maxlength: [100, 'Policy subtype cannot exceed 100 characters']
  },
  
  status: {
    type: String,
    required: [true, 'Policy status is required'],
    enum: {
      values: ['active', 'pending', 'expired', 'cancelled', 'suspended', 'lapsed'],
      message: 'Invalid policy status'
    },
    default: 'pending',
    index: true
  },
  
  company: {
    type: String,
    required: [true, 'Insurance company is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
    index: true
  },
  
  companyPolicyNumber: {
    type: String,
    trim: true,
    maxlength: [100, 'Company policy number cannot exceed 100 characters']
  },
  
  premium: {
    type: PremiumSchema,
    required: [true, 'Premium information is required']
  },
  
  coverage: {
    type: CoverageSchema,
    required: [true, 'Coverage information is required']
  },
  
  startDate: {
    type: Date,
    required: [true, 'Policy start date is required'],
    index: true
  },
  
  endDate: {
    type: Date,
    required: [true, 'Policy end date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    },
    index: true
  },
  
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned agent is required'],
    index: true
  },
  
  commission: {
    type: CommissionSchema,
    required: [true, 'Commission information is required']
  },
  
  // Embedded subdocuments
  documents: [DocumentSchema],
  paymentHistory: [PaymentSchema],
  renewalHistory: [RenewalSchema],
  notes: [NoteSchema],
  
  // Additional fields
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  isAutoRenewal: {
    type: Boolean,
    default: false
  },
  
  lastContactDate: {
    type: Date
  },
  
  nextFollowUpDate: {
    type: Date,
    index: true
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
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
  
  deletedAt: {
    type: Date
  },
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.isDeleted;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
PolicySchema.index({ clientId: 1, status: 1 });
PolicySchema.index({ assignedAgentId: 1, status: 1 });
PolicySchema.index({ company: 1, type: 1 });
PolicySchema.index({ startDate: 1, endDate: 1 });
PolicySchema.index({ 'premium.nextDueDate': 1 });
PolicySchema.index({ nextFollowUpDate: 1 });
PolicySchema.index({ createdAt: -1 });
PolicySchema.index({ 
  policyNumber: 'text', 
  company: 'text', 
  subType: 'text' 
}, {
  weights: {
    policyNumber: 10,
    company: 5,
    subType: 1
  }
});

// Virtual fields
PolicySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.endDate) return null;
  const today = new Date();
  const expiry = new Date(this.endDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

PolicySchema.virtual('isExpiringSoon').get(function() {
  const daysUntilExpiry = this.daysUntilExpiry;
  return daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
});

PolicySchema.virtual('totalPremiumPaid').get(function() {
  return this.paymentHistory
    .filter(payment => payment.status === 'completed')
    .reduce((total, payment) => total + payment.amount, 0);
});

PolicySchema.virtual('lastPaymentDate').get(function() {
  const completedPayments = this.paymentHistory
    .filter(payment => payment.status === 'completed')
    .sort((a, b) => b.date - a.date);
  return completedPayments.length > 0 ? completedPayments[0].date : null;
});

// Pre-save middleware
PolicySchema.pre('save', function(next) {
  // Set updatedBy field
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.constructor.currentUser || null;
  }
  
  // Calculate commission amount if not provided
  if (this.isModified('premium') || this.isModified('commission.rate')) {
    this.commission.amount = (this.premium.amount * this.commission.rate) / 100;
  }
  
  // Set next due date based on frequency
  if (this.isModified('premium.frequency') || this.isModified('startDate')) {
    const startDate = new Date(this.startDate);
    switch (this.premium.frequency) {
      case 'monthly':
        this.premium.nextDueDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
        break;
      case 'quarterly':
        this.premium.nextDueDate = new Date(startDate.setMonth(startDate.getMonth() + 3));
        break;
      case 'semi-annual':
        this.premium.nextDueDate = new Date(startDate.setMonth(startDate.getMonth() + 6));
        break;
      case 'annual':
        this.premium.nextDueDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
        break;
    }
  }
  
  next();
});

// Static methods
PolicySchema.statics.findByAgent = function(agentId) {
  return this.find({ 
    assignedAgentId: agentId, 
    isDeleted: false 
  }).populate('clientId', 'name email phone');
};

PolicySchema.statics.findExpiringSoon = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    endDate: { $lte: futureDate, $gt: new Date() },
    status: 'active',
    isDeleted: false
  }).populate('clientId assignedAgentId', 'name email phone');
};

PolicySchema.statics.getStatistics = function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalPolicies: { $sum: 1 },
        activePolicies: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        expiredPolicies: {
          $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
        },
        cancelledPolicies: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        totalPremium: { $sum: '$premium.amount' },
        avgPremium: { $avg: '$premium.amount' }
      }
    }
  ]);
};

// Instance methods
PolicySchema.methods.addPayment = function(paymentData) {
  this.paymentHistory.push(paymentData);
  return this.save();
};

PolicySchema.methods.addNote = function(noteData) {
  this.notes.push(noteData);
  return this.save();
};

PolicySchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

PolicySchema.methods.renew = function(renewalData) {
  const renewal = {
    renewalDate: new Date(),
    previousEndDate: this.endDate,
    premium: renewalData.premium || this.premium.amount,
    agentId: renewalData.agentId || this.assignedAgentId,
    notes: renewalData.notes
  };
  
  this.renewalHistory.push(renewal);
  this.endDate = renewalData.newEndDate;
  this.premium.amount = renewalData.premium || this.premium.amount;
  this.status = 'active';
  
  return this.save();
};

module.exports = mongoose.model('Policy', PolicySchema);
