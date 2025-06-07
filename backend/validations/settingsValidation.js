
const Joi = require('joi');

// Create settings validation schema
const createSettingsSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'User ID is required'
    }),
  
  userName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'User name must be at least 2 characters long',
      'string.max': 'User name cannot exceed 100 characters',
      'any.required': 'User name is required'
    }),
  
  profile: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    
    email: Joi.string()
      .email()
      .trim()
      .max(255)
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'string.max': 'Email cannot exceed 255 characters',
        'any.required': 'Email is required'
      }),
    
    phone: Joi.string()
      .trim()
      .max(20)
      .pattern(/^(\+\d{1,3}\s?)?\d{10}$|^(\d{3}[-]\d{3}[-]\d{4})$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'Please enter a valid phone number',
        'string.max': 'Phone number cannot exceed 20 characters'
      }),
    
    jobTitle: Joi.string()
      .trim()
      .max(100)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Job title cannot exceed 100 characters'
      }),
    
    avatar: Joi.string()
      .trim()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Avatar URL cannot exceed 500 characters'
      }),
    
    bio: Joi.string()
      .trim()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      })
  }).required(),
  
  notifications: Joi.object({
    emailNotifications: Joi.boolean().default(true),
    smsNotifications: Joi.boolean().default(false),
    pushNotifications: Joi.boolean().default(true),
    marketingEmails: Joi.boolean().default(false),
    activityNotifications: Joi.boolean().default(true),
    systemAlerts: Joi.boolean().default(true),
    weeklyReports: Joi.boolean().default(true),
    monthlyReports: Joi.boolean().default(false)
  }).optional(),
  
  security: Joi.object({
    twoFactorAuth: Joi.boolean().default(false),
    sessionTimeout: Joi.number()
      .integer()
      .min(5)
      .max(120)
      .default(30)
      .messages({
        'number.min': 'Session timeout must be at least 5 minutes',
        'number.max': 'Session timeout cannot exceed 120 minutes'
      }),
    loginAlerts: Joi.boolean().default(true)
  }).optional(),
  
  preferences: Joi.object({
    theme: Joi.string()
      .valid('light', 'dark', 'system')
      .default('system'),
    language: Joi.string()
      .valid('en', 'es', 'fr', 'de', 'it', 'pt', 'hi')
      .default('en'),
    timezone: Joi.string()
      .default('UTC'),
    dateFormat: Joi.string()
      .valid('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')
      .default('MM/DD/YYYY'),
    timeFormat: Joi.string()
      .valid('12h', '24h')
      .default('12h'),
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD')
      .default('USD'),
    dashboardLayout: Joi.string()
      .valid('compact', 'comfortable', 'spacious')
      .default('comfortable'),
    itemsPerPage: Joi.number()
      .integer()
      .min(10)
      .max(100)
      .default(20)
  }).optional(),
  
  privacy: Joi.object({
    profileVisibility: Joi.string()
      .valid('public', 'team', 'private')
      .default('team'),
    activityVisibility: Joi.string()
      .valid('public', 'team', 'private')
      .default('team'),
    dataSharing: Joi.boolean().default(false),
    analytics: Joi.boolean().default(true)
  }).optional()
});

// Update settings validation schema
const updateSettingsSchema = Joi.object({
  profile: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .optional(),
    
    email: Joi.string()
      .email()
      .trim()
      .max(255)
      .optional(),
    
    phone: Joi.string()
      .trim()
      .max(20)
      .pattern(/^(\+\d{1,3}\s?)?\d{10}$|^(\d{3}[-]\d{3}[-]\d{4})$/)
      .optional()
      .allow(''),
    
    jobTitle: Joi.string()
      .trim()
      .max(100)
      .optional()
      .allow(''),
    
    avatar: Joi.string()
      .trim()
      .max(500)
      .optional()
      .allow(''),
    
    bio: Joi.string()
      .trim()
      .max(500)
      .optional()
      .allow('')
  }).optional(),
  
  notifications: Joi.object({
    emailNotifications: Joi.boolean().optional(),
    smsNotifications: Joi.boolean().optional(),
    pushNotifications: Joi.boolean().optional(),
    marketingEmails: Joi.boolean().optional(),
    activityNotifications: Joi.boolean().optional(),
    systemAlerts: Joi.boolean().optional(),
    weeklyReports: Joi.boolean().optional(),
    monthlyReports: Joi.boolean().optional()
  }).optional(),
  
  security: Joi.object({
    twoFactorAuth: Joi.boolean().optional(),
    sessionTimeout: Joi.number()
      .integer()
      .min(5)
      .max(120)
      .optional(),
    loginAlerts: Joi.boolean().optional()
  }).optional(),
  
  preferences: Joi.object({
    theme: Joi.string()
      .valid('light', 'dark', 'system')
      .optional(),
    language: Joi.string()
      .valid('en', 'es', 'fr', 'de', 'it', 'pt', 'hi')
      .optional(),
    timezone: Joi.string().optional(),
    dateFormat: Joi.string()
      .valid('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')
      .optional(),
    timeFormat: Joi.string()
      .valid('12h', '24h')
      .optional(),
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD')
      .optional(),
    dashboardLayout: Joi.string()
      .valid('compact', 'comfortable', 'spacious')
      .optional(),
    itemsPerPage: Joi.number()
      .integer()
      .min(10)
      .max(100)
      .optional()
  }).optional(),
  
  privacy: Joi.object({
    profileVisibility: Joi.string()
      .valid('public', 'team', 'private')
      .optional(),
    activityVisibility: Joi.string()
      .valid('public', 'team', 'private')
      .optional(),
    dataSharing: Joi.boolean().optional(),
    analytics: Joi.boolean().optional()
  }).optional()
});

// Password change validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match new password',
      'any.required': 'Password confirmation is required'
    })
});

// Settings section update schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().trim().max(255).optional(),
  phone: Joi.string().trim().max(20).pattern(/^(\+\d{1,3}\s?)?\d{10}$|^(\d{3}[-]\d{3}[-]\d{4})$/).optional().allow(''),
  jobTitle: Joi.string().trim().max(100).optional().allow(''),
  avatar: Joi.string().trim().max(500).optional().allow(''),
  bio: Joi.string().trim().max(500).optional().allow('')
});

const updateNotificationsSchema = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  smsNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  marketingEmails: Joi.boolean().optional(),
  activityNotifications: Joi.boolean().optional(),
  systemAlerts: Joi.boolean().optional(),
  weeklyReports: Joi.boolean().optional(),
  monthlyReports: Joi.boolean().optional()
});

const updateSecuritySchema = Joi.object({
  twoFactorAuth: Joi.boolean().optional(),
  sessionTimeout: Joi.number().integer().min(5).max(120).optional(),
  loginAlerts: Joi.boolean().optional()
});

const updatePreferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system').optional(),
  language: Joi.string().valid('en', 'es', 'fr', 'de', 'it', 'pt', 'hi').optional(),
  timezone: Joi.string().optional(),
  dateFormat: Joi.string().valid('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD').optional(),
  timeFormat: Joi.string().valid('12h', '24h').optional(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD').optional(),
  dashboardLayout: Joi.string().valid('compact', 'comfortable', 'spacious').optional(),
  itemsPerPage: Joi.number().integer().min(10).max(100).optional()
});

const updatePrivacySchema = Joi.object({
  profileVisibility: Joi.string().valid('public', 'team', 'private').optional(),
  activityVisibility: Joi.string().valid('public', 'team', 'private').optional(),
  dataSharing: Joi.boolean().optional(),
  analytics: Joi.boolean().optional()
});

module.exports = {
  createSettingsSchema,
  updateSettingsSchema,
  changePasswordSchema,
  updateProfileSchema,
  updateNotificationsSchema,
  updateSecuritySchema,
  updatePreferencesSchema,
  updatePrivacySchema
};
