
const mongoose = require('mongoose');

const whatsAppTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  variables: [{
    name: String,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const emailCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  targetSegment: {
    type: String,
    enum: ['All', 'New', 'In Progress', 'Qualified', 'High Priority', 'Stale'],
    default: 'All'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const leadQualificationCriteriaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  criteria: {
    minBudget: { type: Number, default: 0 },
    requiredFields: [String],
    timeframe: { type: String, enum: ['Immediate', 'Within 1 month', 'Within 3 months', 'Within 6 months', 'Later'] },
    sources: [String],
    products: [String]
  },
  scoreThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const settingsSchema = new mongoose.Schema({
  // WhatsApp Configuration
  whatsApp: {
    apiKey: String,
    businessPhone: String,
    templates: [whatsAppTemplateSchema],
    welcomeMessage: {
      type: String,
      default: 'Welcome to our insurance services! We are excited to help you find the perfect coverage. Our agent will contact you soon.'
    }
  },

  // Email Campaign Configuration
  emailCampaigns: [emailCampaignSchema],

  // Lead Qualification Configuration
  leadQualification: [leadQualificationCriteriaSchema],

  // Territory Assignment Rules
  territoryRules: {
    autoAssignment: {
      type: Boolean,
      default: true
    },
    rules: [{
      territory: String,
      cities: [String],
      defaultAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },

  // Lead Scoring Configuration
  leadScoring: {
    budgetWeights: {
      high: { min: Number, score: Number },
      medium: { min: Number, score: Number },
      low: { min: Number, score: Number }
    },
    engagementWeights: {
      followUpMultiplier: { type: Number, default: 2 },
      noteMultiplier: { type: Number, default: 1 },
      recentActivityBonus: { type: Number, default: 10 }
    },
    priorityWeights: {
      high: { type: Number, default: 15 },
      medium: { type: Number, default: 10 },
      low: { type: Number, default: 5 }
    }
  },

  // Stale Lead Configuration
  staleLeadSettings: {
    warningDays: { type: Number, default: 7 },
    staleDays: { type: Number, default: 14 },
    autoReassignDays: { type: Number, default: 21 }
  },

  // High-Value Lead Configuration
  highValueSettings: {
    budgetThreshold: { type: Number, default: 1000000 },
    requiresApproval: { type: Boolean, default: true },
    approverRole: { type: String, enum: ['manager', 'super_admin'], default: 'super_admin' }
  },

  // System Configuration
  system: {
    defaultLeadAssignment: { type: String, enum: ['round_robin', 'territory', 'manual'], default: 'territory' },
    duplicateDetection: { type: Boolean, default: true },
    autoMerge: { type: Boolean, default: true },
    activityLogging: { type: Boolean, default: true }
  },

  // Updated by
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document
settingsSchema.index({ _id: 1 }, { unique: true });

module.exports = mongoose.model('Settings', settingsSchema);
