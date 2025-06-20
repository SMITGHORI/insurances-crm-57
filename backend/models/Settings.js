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

// Enhanced Broadcast Settings Schema
const enhancedBroadcastSettingsSchema = new mongoose.Schema({
  // WhatsApp Business API Configuration
  whatsappBusiness: {
    accessToken: String,
    phoneNumberId: String,
    businessAccountId: String,
    webhookVerifyToken: String,
    isVerified: { type: Boolean, default: false }
  },
  
  // SMS Provider Configuration
  smsProviders: {
    twilio: {
      accountSid: String,
      authToken: String,
      fromNumber: String,
      isActive: { type: Boolean, default: false }
    },
    firebase: {
      projectId: String,
      privateKey: String,
      clientEmail: String,
      isActive: { type: Boolean, default: false }
    },
    aws: {
      accessKeyId: String,
      secretAccessKey: String,
      region: String,
      isActive: { type: Boolean, default: false }
    }
  },
  
  // Social Media Configuration
  socialMedia: {
    facebook: {
      accessToken: String,
      pageId: String,
      isActive: { type: Boolean, default: false }
    },
    instagram: {
      accessToken: String,
      businessAccountId: String,
      isActive: { type: Boolean, default: false }
    },
    twitter: {
      apiKey: String,
      apiSecret: String,
      accessToken: String,
      accessTokenSecret: String,
      isActive: { type: Boolean, default: false }
    }
  },
  
  // Automation Rules
  automationRules: {
    birthdayGreetings: {
      enabled: { type: Boolean, default: true },
      timeToSend: { type: String, default: '09:00' }, // HH:MM format
      channels: [{ type: String, enum: ['email', 'whatsapp', 'sms'] }],
      templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BroadcastTemplate' }
    },
    anniversaryGreetings: {
      enabled: { type: Boolean, default: true },
      timeToSend: { type: String, default: '09:00' },
      channels: [{ type: String, enum: ['email', 'whatsapp', 'sms'] }],
      templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BroadcastTemplate' }
    },
    policyExpiryReminders: {
      enabled: { type: Boolean, default: true },
      reminderDays: [{ type: Number, default: [30, 15, 7, 1] }],
      channels: [{ type: String, enum: ['email', 'whatsapp', 'sms'] }],
      templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BroadcastTemplate' }
    },
    paymentReminders: {
      enabled: { type: Boolean, default: true },
      reminderDays: [{ type: Number, default: [7, 3, 1] }],
      channels: [{ type: String, enum: ['email', 'whatsapp', 'sms'] }],
      templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BroadcastTemplate' }
    },
    claimUpdates: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['email', 'whatsapp', 'sms'] }],
      templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BroadcastTemplate' }
    },
    newClientWelcome: {
      enabled: { type: Boolean, default: true },
      delayHours: { type: Number, default: 1 },
      channels: [{ type: String, enum: ['email', 'whatsapp', 'sms'] }],
      templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'BroadcastTemplate' }
    }
  },
  
  // Approval Workflow Settings
  approvalWorkflow: {
    requiresApproval: {
      offers: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      largeAudience: { type: Boolean, default: true },
      highBudget: { type: Boolean, default: true }
    },
    approvers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['manager', 'super_admin'] },
      categories: [String] // Which broadcast categories they can approve
    }],
    budgetThresholds: {
      lowTier: { type: Number, default: 10000 },
      midTier: { type: Number, default: 50000 },
      highTier: { type: Number, default: 100000 }
    }
  },
  
  // Compliance Settings
  compliance: {
    optOutFooter: {
      text: { type: String, default: 'Reply STOP to unsubscribe from promotional messages' },
      includeInAll: { type: Boolean, default: false },
      includeInOffers: { type: Boolean, default: true }
    },
    dataRetention: {
      broadcastData: { type: Number, default: 365 }, // days
      recipientData: { type: Number, default: 180 },
      analyticsData: { type: Number, default: 730 }
    },
    legalFooter: {
      text: { type: String, default: 'This message is sent in compliance with applicable regulations' },
      required: { type: Boolean, default: true }
    }
  },
  
  // A/B Testing Settings
  abTestingDefaults: {
    testDuration: { type: Number, default: 24 }, // hours
    confidenceLevel: { type: Number, default: 95 },
    minSampleSize: { type: Number, default: 100 },
    autoSelectWinner: { type: Boolean, default: true }
  },
  
  // Rate Limiting and Throttling
  rateLimits: {
    email: {
      perMinute: { type: Number, default: 100 },
      perHour: { type: Number, default: 1000 },
      perDay: { type: Number, default: 10000 }
    },
    whatsapp: {
      perMinute: { type: Number, default: 20 },
      perHour: { type: Number, default: 200 },
      perDay: { type: Number, default: 1000 }
    },
    sms: {
      perMinute: { type: Number, default: 50 },
      perHour: { type: Number, default: 500 },
      perDay: { type: Number, default: 2000 }
    }
  },
  
  // Cost Configuration
  costConfiguration: {
    email: { costPer1000: { type: Number, default: 50 } },
    whatsapp: { costPerMessage: { type: Number, default: 0.5 } },
    sms: { costPerMessage: { type: Number, default: 2 } },
    socialMedia: { costPerPost: { type: Number, default: 10 } }
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

  // Enhanced Broadcast Configuration
  enhancedBroadcast: enhancedBroadcastSettingsSchema,

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
