
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['activity', 'system', 'security', 'notification', 'general']
  },
  description: {
    type: String,
    required: true
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  validationRules: {
    min: Number,
    max: Number,
    options: [String], // For dropdown options
    pattern: String, // For regex validation
    required: Boolean
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for quick lookups
settingsSchema.index({ key: 1 });
settingsSchema.index({ category: 1 });

// Static method to get setting value
settingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting value
settingsSchema.statics.setValue = async function(key, value, userId = null) {
  const setting = await this.findOneAndUpdate(
    { key },
    { 
      value, 
      lastModifiedBy: userId,
      updatedAt: new Date()
    },
    { 
      new: true, 
      upsert: false 
    }
  );
  
  return setting;
};

// Initialize default settings
settingsSchema.statics.initializeDefaults = async function() {
  const defaults = [
    {
      key: 'activity_retention_days',
      value: 7,
      type: 'number',
      category: 'activity',
      description: 'Number of days to retain activity logs before archiving',
      validationRules: {
        min: 1,
        max: 365,
        options: ['1', '3', '7', '14', '30', '60', '90', '180', '365'],
        required: true
      },
      defaultValue: 7
    },
    {
      key: 'activity_auto_archive',
      value: true,
      type: 'boolean',
      category: 'activity',
      description: 'Automatically archive expired activity logs',
      defaultValue: true
    },
    {
      key: 'activity_log_level',
      value: 'all',
      type: 'string',
      category: 'activity',
      description: 'Level of activity logging',
      validationRules: {
        options: ['all', 'critical', 'high', 'medium'],
        required: true
      },
      defaultValue: 'all'
    }
  ];

  for (const setting of defaults) {
    await this.findOneAndUpdate(
      { key: setting.key },
      setting,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('Settings', settingsSchema);
