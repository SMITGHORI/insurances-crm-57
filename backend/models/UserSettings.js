
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSettingsSchema = new mongoose.Schema({
  // Unique identifier for settings
  settingsId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  userName: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  // Profile Settings
  profile: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
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
  
  // Notification Settings
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    activityNotifications: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    monthlyReports: { type: Boolean, default: false }
  },
  
  // Security Settings
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 120
    },
    loginAlerts: { type: Boolean, default: true },
    passwordLastChanged: { type: Date, default: Date.now }
  },
  
  // User Preferences
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
      default: 20,
      min: 10,
      max: 100
    }
  },
  
  // Privacy Settings
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
    dataSharing: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true }
  },
  
  // Metadata
  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 },
  lastSyncedAt: { type: Date, default: Date.now },
  
  // Audit fields
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

// Indexes
userSettingsSchema.index({ userId: 1 }, { unique: true });
userSettingsSchema.index({ settingsId: 1 });
userSettingsSchema.index({ 'profile.email': 1 });
userSettingsSchema.index({ isActive: 1 });
userSettingsSchema.index({ createdAt: -1 });

// Static Methods
userSettingsSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId, isActive: true }).populate('userId', 'name email role');
};

userSettingsSchema.statics.findBySettingsId = function(settingsId) {
  return this.findOne({ settingsId, isActive: true }).populate('userId', 'name email role');
};

userSettingsSchema.statics.createDefaultSettings = async function(userData) {
  const defaultSettings = {
    userId: userData.userId,
    userName: userData.userName,
    profile: {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      jobTitle: userData.jobTitle || '',
      avatar: '',
      bio: ''
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      activityNotifications: true,
      systemAlerts: true,
      weeklyReports: true,
      monthlyReports: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true,
      passwordLastChanged: new Date()
    },
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      dashboardLayout: 'comfortable',
      itemsPerPage: 20
    },
    privacy: {
      profileVisibility: 'team',
      activityVisibility: 'team',
      dataSharing: false,
      analytics: true
    },
    createdBy: userData.userId,
    updatedBy: userData.userId
  };
  
  return this.create(defaultSettings);
};

userSettingsSchema.statics.getSettingsStats = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalSettings: { $sum: 1 },
        totalActiveUsers: { $sum: 1 },
        averageSessionTimeout: { $avg: '$security.sessionTimeout' },
        themeDistribution: {
          $push: '$preferences.theme'
        },
        languageDistribution: {
          $push: '$preferences.language'
        },
        twoFactorEnabled: {
          $sum: { $cond: ['$security.twoFactorAuth', 1, 0] }
        },
        emailNotificationsEnabled: {
          $sum: { $cond: ['$notifications.emailNotifications', 1, 0] }
        }
      }
    },
    {
      $addFields: {
        twoFactorPercentage: {
          $multiply: [{ $divide: ['$twoFactorEnabled', '$totalSettings'] }, 100]
        },
        emailNotificationPercentage: {
          $multiply: [{ $divide: ['$emailNotificationsEnabled', '$totalSettings'] }, 100]
        }
      }
    }
  ]);
};

// Instance Methods
userSettingsSchema.methods.updateProfile = function(profileData) {
  Object.keys(profileData).forEach(key => {
    if (profileData[key] !== undefined) {
      this.profile[key] = profileData[key];
    }
  });
  
  this.updatedBy = this.userId;
  this.lastSyncedAt = new Date();
  this.version += 1;
  
  return this.save();
};

userSettingsSchema.methods.updateNotifications = function(notificationData) {
  Object.keys(notificationData).forEach(key => {
    if (notificationData[key] !== undefined) {
      this.notifications[key] = notificationData[key];
    }
  });
  
  this.updatedBy = this.userId;
  this.lastSyncedAt = new Date();
  this.version += 1;
  
  return this.save();
};

userSettingsSchema.methods.updateSecurity = function(securityData) {
  Object.keys(securityData).forEach(key => {
    if (securityData[key] !== undefined) {
      this.security[key] = securityData[key];
    }
  });
  
  this.updatedBy = this.userId;
  this.lastSyncedAt = new Date();
  this.version += 1;
  
  return this.save();
};

userSettingsSchema.methods.updatePreferences = function(preferencesData) {
  Object.keys(preferencesData).forEach(key => {
    if (preferencesData[key] !== undefined) {
      this.preferences[key] = preferencesData[key];
    }
  });
  
  this.updatedBy = this.userId;
  this.lastSyncedAt = new Date();
  this.version += 1;
  
  return this.save();
};

userSettingsSchema.methods.resetToDefaults = function() {
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
    loginAlerts: true,
    passwordLastChanged: this.security.passwordLastChanged
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
  this.lastSyncedAt = new Date();
  this.version += 1;
  
  return this.save();
};

// Pre-save middleware
userSettingsSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastSyncedAt = new Date();
  }
  next();
});

// Post-save middleware for logging
userSettingsSchema.post('save', function(doc) {
  console.log(`Settings updated for user: ${doc.userId}`);
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
