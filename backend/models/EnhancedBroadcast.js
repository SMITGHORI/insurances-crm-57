
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Enhanced Broadcast Schema with automation and A/B testing
const enhancedBroadcastSchema = new Schema({
  // Basic broadcast info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['offer', 'festival', 'announcement', 'promotion', 'newsletter', 'reminder', 'policy_renewal', 'payment_due', 'claim_update', 'birthday', 'anniversary', 'welcome']
  },
  
  // Multi-channel support
  channels: [{
    type: String,
    enum: ['email', 'whatsapp', 'sms', 'facebook', 'instagram', 'twitter'],
    required: true
  }],
  
  // Channel-specific configurations
  channelConfigs: {
    email: {
      subject: String,
      template: String,
      trackOpens: { type: Boolean, default: true },
      trackClicks: { type: Boolean, default: true }
    },
    whatsapp: {
      template: String,
      mediaUrl: String,
      businessApiConfig: {
        templateId: String,
        namespace: String
      }
    },
    sms: {
      provider: { type: String, enum: ['twilio', 'firebase', 'aws', 'custom'] },
      template: String,
      senderId: String
    },
    social: {
      platforms: [{ type: String, enum: ['facebook', 'instagram', 'twitter'] }],
      content: String,
      mediaUrls: [String],
      hashtags: [String]
    }
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // A/B Testing
  abTest: {
    enabled: { type: Boolean, default: false },
    variants: [{
      name: String,
      content: String,
      subject: String,
      percentage: { type: Number, min: 0, max: 100 },
      stats: {
        sent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        converted: { type: Number, default: 0 }
      }
    }],
    winningVariant: String,
    testDuration: { type: Number, default: 24 }, // hours
    confidenceLevel: { type: Number, default: 95 }
  },
  
  // Advanced targeting
  targetAudience: {
    allClients: { type: Boolean, default: false },
    specificClients: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
    clientTypes: [{ type: String, enum: ['individual', 'corporate', 'group'] }],
    tierLevels: [{ type: String, enum: ['bronze', 'silver', 'gold', 'platinum'] }],
    locations: [{
      city: String,
      state: String,
      pincode: String
    }],
    policyTypes: [String],
    policyStatus: [{ type: String, enum: ['active', 'expiring', 'expired', 'lapsed'] }],
    premiumRange: {
      min: Number,
      max: Number
    },
    claimHistory: { type: String, enum: ['none', 'low', 'medium', 'high'] },
    lastInteraction: {
      days: Number,
      operator: { type: String, enum: ['>', '<', '='] }
    }
  },
  
  // Automation triggers
  automation: {
    isAutomated: { type: Boolean, default: false },
    trigger: {
      type: { type: String, enum: ['policy_expiry', 'payment_due', 'birthday', 'anniversary', 'claim_status', 'new_client', 'policy_renewal', 'inactivity'] },
      conditions: {
        daysBefore: Number, // for expiry/due date triggers
        claimStatus: String, // for claim triggers
        inactivityDays: Number // for inactivity triggers
      }
    },
    recurring: {
      enabled: { type: Boolean, default: false },
      pattern: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'] },
      customCron: String,
      endDate: Date
    }
  },
  
  // Approval workflow
  approval: {
    required: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectionReason: String,
    complianceChecked: { type: Boolean, default: false }
  },
  
  // Scheduling
  scheduledAt: { type: Date, default: Date.now },
  timezone: { type: String, default: 'Asia/Kolkata' },
  
  // Status and tracking
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'draft'
  },
  
  // Enhanced statistics
  stats: {
    totalRecipients: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    openedCount: { type: Number, default: 0 },
    clickedCount: { type: Number, default: 0 },
    unsubscribedCount: { type: Number, default: 0 },
    convertedCount: { type: Number, default: 0 },
    revenueGenerated: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    
    // Channel-wise stats
    channelStats: [{
      channel: String,
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      cost: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }]
  },
  
  // Personalization and templates
  personalization: {
    enabled: { type: Boolean, default: true },
    variables: [{
      name: String,
      source: { type: String, enum: ['client', 'policy', 'claim', 'payment', 'custom'] },
      field: String,
      defaultValue: String
    }],
    conditionalContent: [{
      condition: String, // JavaScript expression
      content: String,
      fallback: String
    }]
  },
  
  // Compliance and legal
  compliance: {
    regulatoryApproved: { type: Boolean, default: false },
    legalReviewed: { type: Boolean, default: false },
    optOutCompliant: { type: Boolean, default: true },
    dataProtectionCompliant: { type: Boolean, default: true },
    consentRequired: { type: Boolean, default: false },
    retentionPeriod: { type: Number, default: 365 } // days
  },
  
  // Campaign tracking
  campaign: {
    id: String,
    name: String,
    budget: Number,
    costPerRecipient: Number,
    expectedROI: Number
  },
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Broadcast Template Schema
const broadcastTemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['policy_renewal', 'payment_reminder', 'claim_update', 'birthday', 'anniversary', 'welcome', 'offer', 'festival', 'compliance']
  },
  channels: [{
    type: String,
    enum: ['email', 'whatsapp', 'sms', 'social']
  }],
  templates: {
    email: {
      subject: String,
      html: String,
      text: String
    },
    whatsapp: {
      text: String,
      mediaType: { type: String, enum: ['none', 'image', 'document', 'video'] },
      businessTemplate: {
        name: String,
        namespace: String,
        components: [Schema.Types.Mixed]
      }
    },
    sms: {
      text: String,
      unicode: { type: Boolean, default: false }
    },
    social: {
      text: String,
      hashtags: [String],
      mentions: [String]
    }
  },
  variables: [{
    name: String,
    description: String,
    source: String,
    required: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
  isCompliant: { type: Boolean, default: true },
  complianceNotes: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Enhanced Broadcast Recipient with detailed tracking
const enhancedBroadcastRecipientSchema = new Schema({
  broadcastId: { type: Schema.Types.ObjectId, ref: 'EnhancedBroadcast', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  channel: {
    type: String,
    enum: ['email', 'whatsapp', 'sms', 'facebook', 'instagram', 'twitter'],
    required: true
  },
  
  // Enhanced status tracking
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced', 'spam', 'opted_out', 'converted'],
    default: 'pending'
  },
  
  // Detailed timestamps
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  firstClickAt: Date,
  lastClickAt: Date,
  convertedAt: Date,
  
  // A/B test variant
  abVariant: String,
  
  // Personalized content
  personalizedContent: {
    subject: String,
    content: String,
    variables: Schema.Types.Mixed
  },
  
  // Engagement tracking
  engagement: {
    opens: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // seconds
    lastActivity: Date,
    score: { type: Number, default: 0 }
  },
  
  // Delivery details
  delivery: {
    provider: String,
    messageId: String,
    cost: { type: Number, default: 0 },
    errorMessage: String,
    retryCount: { type: Number, default: 0 }
  },
  
  // Conversion tracking
  conversion: {
    policyId: { type: Schema.Types.ObjectId, ref: 'Policy' },
    revenue: { type: Number, default: 0 },
    commissionEarned: { type: Number, default: 0 },
    conversionType: { type: String, enum: ['new_policy', 'renewal', 'upgrade', 'addon'] }
  },
  
  // Communication record reference
  communicationId: { type: Schema.Types.ObjectId, ref: 'Communication' }
}, {
  timestamps: true
});

// Indexes for performance
enhancedBroadcastSchema.index({ createdBy: 1, createdAt: -1 });
enhancedBroadcastSchema.index({ status: 1, scheduledAt: 1 });
enhancedBroadcastSchema.index({ type: 1, 'automation.trigger.type': 1 });
enhancedBroadcastSchema.index({ 'approval.status': 1 });

broadcastTemplateSchema.index({ category: 1, isActive: 1 });
broadcastTemplateSchema.index({ name: 1 });

enhancedBroadcastRecipientSchema.index({ broadcastId: 1, clientId: 1, channel: 1 });
enhancedBroadcastRecipientSchema.index({ status: 1, sentAt: 1 });
enhancedBroadcastRecipientSchema.index({ 'conversion.policyId': 1 });

module.exports = {
  EnhancedBroadcast: mongoose.model('EnhancedBroadcast', enhancedBroadcastSchema),
  BroadcastTemplate: mongoose.model('BroadcastTemplate', broadcastTemplateSchema),
  EnhancedBroadcastRecipient: mongoose.model('EnhancedBroadcastRecipient', enhancedBroadcastRecipientSchema)
};
