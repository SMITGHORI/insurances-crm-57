
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  settingsId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One settings document per user
  },
  userName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      match: [/^(\+\d{1,3}\s?)?\d{10}$|^(\d{3}[-]\d{3}[-]\d{4})$/, 'Please enter a valid phone number']
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 100
    },
    avatar: {
      type: String,
      trim: true,
      maxlength: 500
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    activityNotifications: {
      type: Boolean,
      default: true
    },
    systemAlerts: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    monthlyReports: {
      type: Boolean,
      default: false
    }
  },
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      min: 5,
      max: 120,
      default: 30 // minutes
    },
    loginAlerts: {
      type: Boolean,
      default: true
    },
    passwordLastChanged: {
      type: Date
    },
    lastPasswordChangeRequest: {
      type: Date
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'hi'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
      default: 'USD'
    },
    dashboardLayout: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    },
    itemsPerPage: {
      type: Number,
      min: 10,
      max: 100,
      default: 20
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'team', 'private'],
      default: 'team'
    },
    activityVisibility: {
      type: String,
      enum: ['public', 'team', 'private'],
      default: 'team'
    },
    dataSharing: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: true
    }
  },
  version: {
    type: Number,
    default: 1
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
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
  versionKey: false
});

// Indexes for better query performance
settingsSchema.index({ settingsId: 1 });
settingsSchema.index({ userId: 1 }, { unique: true });
settingsSchema.index({ 'profile.email': 1 });
settingsSchema.index({ isActive: 1 });
settingsSchema.index({ createdAt: -1 });
settingsSchema.index({ updatedAt: -1 });

// Compound indexes
settingsSchema.index({ userId: 1, isActive: 1 });
settingsSchema.index({ 'profile.name': 'text', 'profile.email': 'text' });

// Pre-save middleware to generate settingsId
settingsSchema.pre('save', async function(next) {
  if (this.isNew && !this.settingsId) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.settingsId = `SET-${year}${month}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for checking if profile is complete
settingsSchema.virtual('isProfileComplete').get(function() {
  return !!(
    this.profile.name &&
    this.profile.email &&
    this.profile.phone &&
    this.profile.jobTitle
  );
});

// Virtual for security score
settingsSchema.virtual('securityScore').get(function() {
  let score = 0;
  if (this.security.twoFactorAuth) score += 30;
  if (this.security.loginAlerts) score += 20;
  if (this.security.sessionTimeout <= 30) score += 25;
  if (this.security.passwordLastChanged && 
      Date.now() - this.security.passwordLastChanged < 90 * 24 * 60 * 60 * 1000) score += 25;
  return score;
});

// Methods
settingsSchema.methods.updateProfile = function(profileData) {
  Object.assign(this.profile, profileData);
  this.updatedBy = this.userId;
  return this.save();
};

settingsSchema.methods.updateNotifications = function(notificationData) {
  Object.assign(this.notifications, notificationData);
  this.updatedBy = this.userId;
  return this.save();
};

settingsSchema.methods.updateSecurity = function(securityData) {
  Object.assign(this.security, securityData);
  this.updatedBy = this.userId;
  return this.save();
};

settingsSchema.methods.updatePreferences = function(preferencesData) {
  Object.assign(this.preferences, preferencesData);
  this.updatedBy = this.userId;
  return this.save();
};

settingsSchema.methods.resetToDefaults = function() {
  this.notifications = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    activityNotifications: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: false
  };
  
  this.security = {
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true
  };
  
  this.preferences = {
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    dashboardLayout: 'comfortable',
    itemsPerPage: 20
  };
  
  this.privacy = {
    profileVisibility: 'team',
    activityVisibility: 'team',
    dataSharing: false,
    analytics: true
  };
  
  this.updatedBy = this.userId;
  return this.save();
};

// Static methods
settingsSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId, isActive: true });
};

settingsSchema.statics.createDefaultSettings = function(userData) {
  return this.create({
    userId: userData.userId,
    userName: userData.userName,
    profile: {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      jobTitle: userData.jobTitle || ''
    },
    createdBy: userData.userId,
    updatedBy: userData.userId
  });
};

settingsSchema.statics.getSettingsStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        twoFactorEnabled: {
          $sum: { $cond: ['$security.twoFactorAuth', 1, 0] }
        },
        emailNotificationsEnabled: {
          $sum: { $cond: ['$notifications.emailNotifications', 1, 0] }
        },
        darkThemeUsers: {
          $sum: { $cond: [{ $eq: ['$preferences.theme', 'dark'] }, 1, 0] }
        },
        completeProfiles: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$profile.name', ''] },
                  { $ne: ['$profile.email', ''] },
                  { $ne: ['$profile.phone', ''] },
                  { $ne: ['$profile.jobTitle', ''] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Settings', settingsSchema);
