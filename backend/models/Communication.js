
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Template Schema for message templates
const templateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['birthday', 'anniversary', 'offer', 'points', 'eligibility', 'renewal_reminder', 'custom']
  },
  channel: {
    type: String,
    required: true,
    enum: ['email', 'whatsapp', 'sms', 'both']
  },
  subject: {
    type: String,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  variables: [{
    name: String,
    description: String,
    required: Boolean,
    defaultValue: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Communication Log Schema
const communicationSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  policyId: {
    type: Schema.Types.ObjectId,
    ref: 'Policy',
    sparse: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['birthday', 'anniversary', 'offer', 'points', 'eligibility', 'renewal_reminder', 'custom'],
    index: true
  },
  channel: {
    type: String,
    required: true,
    enum: ['email', 'whatsapp', 'sms']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending',
    index: true
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template'
  },
  subject: {
    type: String,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    index: true
  },
  deliveredAt: {
    type: Date
  },
  errorMessage: {
    type: String,
    maxlength: 500
  },
  metadata: {
    messageId: String,
    provider: String,
    campaignId: String,
    cost: Number
  },
  scheduledFor: {
    type: Date,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Loyalty Points Schema
const loyaltyPointsSchema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    unique: true,
    index: true
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  availablePoints: {
    type: Number,
    default: 0,
    min: 0
  },
  tierLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  nextTierThreshold: {
    type: Number,
    default: 1000
  },
  pointsHistory: [{
    transactionType: {
      type: String,
      enum: ['earned', 'redeemed', 'expired', 'adjusted'],
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true,
      maxlength: 200
    },
    policyId: {
      type: Schema.Types.ObjectId,
      ref: 'Policy'
    },
    date: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Offer Schema
const offerSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['discount', 'cashback', 'bonus_points', 'free_addon', 'premium_waiver', 'special_rate']
  },
  applicableProducts: [{
    type: String,
    enum: ['life', 'health', 'auto', 'home', 'business', 'travel', 'disability']
  }],
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    min: 0
  },
  eligibilityCriteria: {
    minAge: Number,
    maxAge: Number,
    clientTypes: [{
      type: String,
      enum: ['individual', 'corporate', 'group']
    }],
    existingPolicyRequired: Boolean,
    minPremium: Number,
    tierLevels: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }]
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  maxUsageCount: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  currentUsageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  targetAudience: {
    allClients: {
      type: Boolean,
      default: false
    },
    specificClients: [{
      type: Schema.Types.ObjectId,
      ref: 'Client'
    }],
    birthdayClients: Boolean,
    anniversaryClients: Boolean,
    tierBasedClients: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }]
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Automation Rules Schema
const automationRuleSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['birthday', 'anniversary', 'offer_notification', 'points_update', 'renewal_reminder', 'welcome', 'policy_expiry']
  },
  trigger: {
    event: {
      type: String,
      required: true,
      enum: ['date_based', 'policy_created', 'policy_renewed', 'points_earned', 'tier_upgraded', 'manual']
    },
    daysOffset: Number, // e.g., -7 for 7 days before, +1 for 1 day after
    timeOfDay: String // e.g., "09:00"
  },
  conditions: {
    clientTypes: [{
      type: String,
      enum: ['individual', 'corporate', 'group']
    }],
    policyTypes: [{
      type: String,
      enum: ['life', 'health', 'auto', 'home', 'business', 'travel', 'disability']
    }],
    minPremium: Number,
    tierLevels: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }],
    agentIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  action: {
    channel: {
      type: String,
      required: true,
      enum: ['email', 'whatsapp', 'sms', 'both']
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'Template'
    },
    delayMinutes: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date,
    index: true
  },
  stats: {
    totalRuns: {
      type: Number,
      default: 0
    },
    successfulSends: {
      type: Number,
      default: 0
    },
    failedSends: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
communicationSchema.index({ clientId: 1, type: 1, createdAt: -1 });
communicationSchema.index({ status: 1, scheduledFor: 1 });
communicationSchema.index({ agentId: 1, createdAt: -1 });

loyaltyPointsSchema.index({ totalPoints: -1 });
loyaltyPointsSchema.index({ tierLevel: 1 });

offerSchema.index({ validFrom: 1, validUntil: 1, isActive: 1 });
offerSchema.index({ applicableProducts: 1, isActive: 1 });

automationRuleSchema.index({ type: 1, isActive: 1 });
automationRuleSchema.index({ nextRun: 1, isActive: 1 });

// Virtual fields
loyaltyPointsSchema.virtual('pointsToNextTier').get(function() {
  return Math.max(0, this.nextTierThreshold - this.totalPoints);
});

offerSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && this.validFrom <= now && this.validUntil >= now;
});

offerSchema.virtual('remainingUsage').get(function() {
  if (this.maxUsageCount === -1) return -1;
  return Math.max(0, this.maxUsageCount - this.currentUsageCount);
});

// Static methods
communicationSchema.statics.getStats = function(agentId, dateRange) {
  const match = { agentId };
  if (dateRange) {
    match.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        types: { $push: '$type' }
      }
    }
  ]);
};

loyaltyPointsSchema.statics.updateTier = function(clientId) {
  return this.findOne({ clientId }).then(loyalty => {
    if (!loyalty) return null;
    
    const tierThresholds = { bronze: 0, silver: 1000, gold: 5000, platinum: 15000 };
    let newTier = 'bronze';
    let nextThreshold = 1000;
    
    for (const [tier, threshold] of Object.entries(tierThresholds)) {
      if (loyalty.totalPoints >= threshold) {
        newTier = tier;
      }
    }
    
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tierOrder.indexOf(newTier);
    if (currentIndex < tierOrder.length - 1) {
      const nextTier = tierOrder[currentIndex + 1];
      nextThreshold = tierThresholds[nextTier];
    } else {
      nextThreshold = loyalty.totalPoints; // Max tier reached
    }
    
    loyalty.tierLevel = newTier;
    loyalty.nextTierThreshold = nextThreshold;
    return loyalty.save();
  });
};

module.exports = {
  Communication: mongoose.model('Communication', communicationSchema),
  LoyaltyPoints: mongoose.model('LoyaltyPoints', loyaltyPointsSchema),
  Offer: mongoose.model('Offer', offerSchema),
  AutomationRule: mongoose.model('AutomationRule', automationRuleSchema),
  Template: mongoose.model('Template', templateSchema)
};
