
const Joi = require('joi');

const validateEnhancedBroadcast = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('offer', 'festival', 'announcement', 'promotion', 'newsletter', 'reminder', 'policy_renewal', 'payment_due', 'claim_update', 'birthday', 'anniversary', 'welcome').required(),
  channels: Joi.array().items(Joi.string().valid('email', 'whatsapp', 'sms', 'facebook', 'instagram', 'twitter')).min(1).required(),
  channelConfigs: Joi.object({
    email: Joi.object({
      subject: Joi.string().max(200),
      template: Joi.string(),
      trackOpens: Joi.boolean().default(true),
      trackClicks: Joi.boolean().default(true)
    }).optional(),
    whatsapp: Joi.object({
      template: Joi.string(),
      mediaUrl: Joi.string().uri(),
      businessApiConfig: Joi.object({
        templateId: Joi.string(),
        namespace: Joi.string()
      }).optional()
    }).optional(),
    sms: Joi.object({
      provider: Joi.string().valid('twilio', 'firebase', 'aws', 'custom'),
      template: Joi.string(),
      senderId: Joi.string()
    }).optional(),
    social: Joi.object({
      platforms: Joi.array().items(Joi.string().valid('facebook', 'instagram', 'twitter')),
      content: Joi.string(),
      mediaUrls: Joi.array().items(Joi.string().uri()),
      hashtags: Joi.array().items(Joi.string())
    }).optional()
  }).optional(),
  content: Joi.string().max(5000).required(),
  
  // A/B Testing
  abTest: Joi.object({
    enabled: Joi.boolean().default(false),
    variants: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      content: Joi.string().required(),
      subject: Joi.string(),
      percentage: Joi.number().min(0).max(100).required()
    })).when('enabled', { is: true, then: Joi.required() }),
    testDuration: Joi.number().default(24),
    confidenceLevel: Joi.number().default(95)
  }).optional(),
  
  // Target Audience
  targetAudience: Joi.object({
    allClients: Joi.boolean().default(false),
    specificClients: Joi.array().items(Joi.string().hex().length(24)).optional(),
    clientTypes: Joi.array().items(Joi.string().valid('individual', 'corporate', 'group')).optional(),
    tierLevels: Joi.array().items(Joi.string().valid('bronze', 'silver', 'gold', 'platinum')).optional(),
    locations: Joi.array().items(Joi.object({
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      pincode: Joi.string().optional()
    })).optional(),
    policyTypes: Joi.array().items(Joi.string()).optional(),
    policyStatus: Joi.array().items(Joi.string().valid('active', 'expiring', 'expired', 'lapsed')).optional(),
    premiumRange: Joi.object({
      min: Joi.number(),
      max: Joi.number()
    }).optional()
  }).required(),
  
  // Automation
  automation: Joi.object({
    isAutomated: Joi.boolean().default(false),
    trigger: Joi.object({
      type: Joi.string().valid('policy_expiry', 'payment_due', 'birthday', 'anniversary', 'claim_status', 'new_client', 'policy_renewal', 'inactivity'),
      conditions: Joi.object({
        daysBefore: Joi.number(),
        claimStatus: Joi.string(),
        inactivityDays: Joi.number()
      }).optional()
    }).when('isAutomated', { is: true, then: Joi.required() }),
    recurring: Joi.object({
      enabled: Joi.boolean().default(false),
      pattern: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom'),
      customCron: Joi.string(),
      endDate: Joi.date()
    }).optional()
  }).optional(),
  
  scheduledAt: Joi.date().min('now').optional(),
  timezone: Joi.string().default('Asia/Kolkata'),
  
  // Campaign tracking
  campaign: Joi.object({
    id: Joi.string(),
    name: Joi.string(),
    budget: Joi.number().min(0),
    costPerRecipient: Joi.number().min(0),
    expectedROI: Joi.number()
  }).optional()
});

const validateBroadcastTemplate = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().valid('policy_renewal', 'payment_reminder', 'claim_update', 'birthday', 'anniversary', 'welcome', 'offer', 'festival', 'compliance').required(),
  channels: Joi.array().items(Joi.string().valid('email', 'whatsapp', 'sms', 'social')).min(1).required(),
  templates: Joi.object({
    email: Joi.object({
      subject: Joi.string(),
      html: Joi.string(),
      text: Joi.string()
    }).optional(),
    whatsapp: Joi.object({
      text: Joi.string(),
      mediaType: Joi.string().valid('none', 'image', 'document', 'video'),
      businessTemplate: Joi.object({
        name: Joi.string(),
        namespace: Joi.string(),
        components: Joi.array()
      }).optional()
    }).optional(),
    sms: Joi.object({
      text: Joi.string(),
      unicode: Joi.boolean().default(false)
    }).optional(),
    social: Joi.object({
      text: Joi.string(),
      hashtags: Joi.array().items(Joi.string()),
      mentions: Joi.array().items(Joi.string())
    }).optional()
  }).required(),
  variables: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    source: Joi.string(),
    required: Joi.boolean().default(false)
  })).optional(),
  complianceNotes: Joi.string().optional()
});

const validateApproval = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  reason: Joi.string().when('action', { is: 'reject', then: Joi.required() })
});

module.exports = {
  validateEnhancedBroadcast,
  validateBroadcastTemplate,
  validateApproval
};
