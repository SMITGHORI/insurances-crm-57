
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = mongoose;

// Document sub-schema
const documentSchema = new Schema({
  documentType: {
    type: String,
    required: true,
    enum: ['policy_document', 'certificate', 'endorsement', 'claim_form', 'medical_report', 'other']
  },
  name: {
    type: String,
    required: true,
    trim: true
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

// Payment sub-schema
const paymentSchema = new Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'cheque', 'online', 'card', 'bank_transfer', 'upi']
  },
  transactionId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
});

// Renewal sub-schema
const renewalSchema = new Schema({
  renewalDate: {
    type: Date,
    required: true
  },
  previousEndDate: {
    type: Date,
    required: true
  },
  newEndDate: {
    type: Date,
    required: true
  },
  previousPremium: {
    type: Number,
    required: true
  },
  newPremium: {
    type: Number,
    required: true
  },
  renewalType: {
    type: String,
    enum: ['automatic', 'manual'],
    default: 'manual'
  },
  notes: {
    type: String,
    trim: true
  },
  renewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Notes sub-schema
const noteSchema = new Schema({
  note: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Commission sub-schema
const commissionSchema = new Schema({
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['first_year', 'renewal', 'bonus'],
    default: 'first_year'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'hold'],
    default: 'pending'
  },
  paidDate: {
    type: Date
  }
});

// Main policy schema
const policySchema = new Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'life',
      'health',
      'motor',
      'home',
      'travel',
      'marine',
      'fire',
      'personal_accident',
      'group_health',
      'group_life',
      'commercial',
      'other'
    ],
    index: true
  },
  category: {
    type: String,
    enum: ['individual', 'family', 'group', 'corporate'],
    default: 'individual'
  },
  insuranceCompany: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  planName: {
    type: String,
    required: true,
    trim: true
  },
  sumAssured: {
    type: Number,
    required: true,
    min: 0
  },
  premium: {
    type: Number,
    required: true,
    min: 0
  },
  paymentFrequency: {
    type: String,
    required: true,
    enum: ['monthly', 'quarterly', 'half_yearly', 'yearly', 'single'],
    default: 'yearly'
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  maturityDate: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Proposal', 'Active', 'Lapsed', 'Matured', 'Cancelled', 'Expired', 'Suspended'],
    default: 'Proposal',
    index: true
  },
  gracePeriod: {
    type: Number,
    default: 30,
    min: 0
  },
  policyTermYears: {
    type: Number,
    min: 1
  },
  premiumPaymentTermYears: {
    type: Number,
    min: 1
  },
  lockInPeriod: {
    type: Number,
    default: 0,
    min: 0
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  nextYearPremium: {
    type: Number,
    min: 0
  },
  totalPremiumPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  lastPremiumPaidDate: {
    type: Date
  },
  nextPremiumDueDate: {
    type: Date
  },
  // Nominees for life insurance
  nominees: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      type: String,
      trim: true
    }
  }],
  // Type-specific details
  typeSpecificDetails: {
    type: Schema.Types.Mixed,
    default: {}
  },
  // Motor insurance specific fields
  vehicleDetails: {
    registrationNumber: String,
    make: String,
    model: String,
    variant: String,
    yearOfManufacture: Number,
    engineNumber: String,
    chassisNumber: String,
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid']
    },
    cubicCapacity: Number,
    seatingCapacity: Number,
    vehicleType: {
      type: String,
      enum: ['two_wheeler', 'car', 'commercial', 'truck', 'bus']
    }
  },
  // Health insurance specific fields
  healthDetails: {
    preExistingDiseases: [String],
    familyMedicalHistory: String,
    coverageType: {
      type: String,
      enum: ['individual', 'family_floater', 'group']
    },
    roomRentLimit: Number,
    copaymentPercentage: Number,
    waitingPeriod: Number
  },
  // Travel insurance specific fields
  travelDetails: {
    destination: String,
    travelStartDate: Date,
    travelEndDate: Date,
    travelPurpose: {
      type: String,
      enum: ['leisure', 'business', 'education', 'medical']
    },
    numberOfTravelers: Number
  },
  // Agent and commission details
  assignedAgentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  commission: commissionSchema,
  // Related documents
  documents: [documentSchema],
  // Payment history
  payments: [paymentSchema],
  // Renewal history
  renewals: [renewalSchema],
  // Notes and comments
  notes: [noteSchema],
  // Policy source
  source: {
    type: String,
    enum: ['direct', 'referral', 'online', 'campaign', 'renewal'],
    default: 'direct'
  },
  // Endorsements
  endorsements: [{
    endorsementNumber: {
      type: String,
      required: true
    },
    endorsementDate: {
      type: Date,
      required: true
    },
    endorsementType: {
      type: String,
      required: true,
      enum: ['addition', 'deletion', 'modification', 'cancellation']
    },
    description: {
      type: String,
      required: true
    },
    premiumImpact: {
      type: Number,
      default: 0
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  // Audit fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
policySchema.index({ clientId: 1, status: 1 });
policySchema.index({ assignedAgentId: 1, status: 1 });
policySchema.index({ type: 1, status: 1 });
policySchema.index({ endDate: 1, status: 1 });
policySchema.index({ nextPremiumDueDate: 1 });
policySchema.index({ createdAt: -1 });

// Text index for search functionality
policySchema.index({
  policyNumber: 'text',
  planName: 'text',
  insuranceCompany: 'text'
});

// Virtual for days until expiry
policySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.endDate) return null;
  const today = new Date();
  const diffTime = this.endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for policy age in days
policySchema.virtual('policyAgeInDays').get(function() {
  if (!this.startDate) return null;
  const today = new Date();
  const diffTime = today - this.startDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for next premium due status
policySchema.virtual('isPremiumDue').get(function() {
  if (!this.nextPremiumDueDate) return false;
  const today = new Date();
  return this.nextPremiumDueDate <= today;
});

// Virtual for total commission earned
policySchema.virtual('totalCommissionEarned').get(function() {
  return this.payments.reduce((total, payment) => {
    if (payment.status === 'completed' && this.commission) {
      return total + (payment.amount * this.commission.percentage / 100);
    }
    return total;
  }, 0);
});

// Pre-save middleware to generate policy number
policySchema.pre('save', async function(next) {
  if (this.isNew && !this.policyNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.policyNumber = `POL${year}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware for calculating next premium due date
policySchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('paymentFrequency')) {
    const start = new Date(this.startDate);
    
    switch (this.paymentFrequency) {
      case 'monthly':
        start.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() + 3);
        break;
      case 'half_yearly':
        start.setMonth(start.getMonth() + 6);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() + 1);
        break;
      default:
        start.setFullYear(start.getFullYear() + 1);
    }
    
    this.nextPremiumDueDate = start;
  }
  next();
});

// Pre-save middleware for audit trail
policySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.modifiedBy; // Set by middleware
  }
  next();
});

// Instance methods
policySchema.methods.addPayment = function(paymentData) {
  this.payments.push(paymentData);
  
  // Update total premium paid
  this.totalPremiumPaid = this.payments
    .filter(p => p.status === 'completed')
    .reduce((total, p) => total + p.amount, 0);
  
  // Update last premium paid date
  const completedPayments = this.payments.filter(p => p.status === 'completed');
  if (completedPayments.length > 0) {
    this.lastPremiumPaidDate = Math.max(...completedPayments.map(p => p.paymentDate));
  }
  
  return this.save();
};

policySchema.methods.addDocument = function(documentData) {
  this.documents.push(documentData);
  return this.save();
};

policySchema.methods.renewPolicy = function(renewalData) {
  // Add to renewal history
  const renewal = {
    renewalDate: new Date(),
    previousEndDate: this.endDate,
    newEndDate: renewalData.newEndDate,
    previousPremium: this.premium,
    newPremium: renewalData.newPremium || this.premium,
    renewalType: renewalData.renewalType || 'manual',
    notes: renewalData.notes,
    renewedBy: renewalData.renewedBy
  };
  
  this.renewals.push(renewal);
  
  // Update policy details
  this.endDate = renewalData.newEndDate;
  this.premium = renewalData.newPremium || this.premium;
  this.status = 'Active';
  
  return this.save();
};

policySchema.methods.addEndorsement = function(endorsementData) {
  this.endorsements.push(endorsementData);
  
  // Apply premium impact
  if (endorsementData.premiumImpact) {
    this.premium += endorsementData.premiumImpact;
  }
  
  return this.save();
};

// Static methods
policySchema.statics.findByAgent = function(agentId, filters = {}) {
  return this.find({ assignedAgentId: agentId, ...filters });
};

policySchema.statics.findExpiring = function(days = 30, agentId = null) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  let filter = {
    status: 'Active',
    endDate: { $lte: expiryDate }
  };
  
  if (agentId) {
    filter.assignedAgentId = agentId;
  }
  
  return this.find(filter).sort({ endDate: 1 });
};

policySchema.statics.findDueForRenewal = function(days = 30, agentId = null) {
  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + days);
  
  let filter = {
    status: 'Active',
    endDate: { $lte: renewalDate }
  };
  
  if (agentId) {
    filter.assignedAgentId = agentId;
  }
  
  return this.find(filter).sort({ endDate: 1 });
};

policySchema.statics.getAgentStats = function(agentId) {
  return this.aggregate([
    { $match: { assignedAgentId: mongoose.Types.ObjectId(agentId) } },
    {
      $group: {
        _id: null,
        totalPolicies: { $sum: 1 },
        activePolicies: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        totalPremium: { $sum: '$premium' },
        totalCommission: { $sum: '$commission.amount' }
      }
    }
  ]);
};

// Add pagination plugin
policySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Policy', policySchema);
