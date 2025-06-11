
const mongoose = require('mongoose');

const changeDetailSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    maxlength: 100
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'date', 'object', 'array'],
    default: 'string'
  }
});

const activitySchema = new mongoose.Schema({
  activityId: {
    type: String,
    unique: true,
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: [
      'client', 'policy', 'claim', 'quotation', 'lead', 'agent', 'user', 
      'payment', 'document', 'commission', 'reminder', 'system', 'auth',
      'plan', 'invoice', 'setting', 'export', 'import', 'bulk_operation'
    ],
    required: true
  },
  operation: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'bulk_update', 'bulk_delete'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  details: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  entityType: {
    type: String,
    enum: ['client', 'policy', 'claim', 'quotation', 'lead', 'agent', 'user', 'plan', 'invoice', 'setting'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  agentName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  userRole: {
    type: String,
    enum: ['super_admin', 'manager', 'agent'],
    required: true
  },
  changeDetails: [changeDetailSchema],
  beforeState: {
    type: mongoose.Schema.Types.Mixed
  },
  afterState: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ipAddress: {
      type: String,
      maxlength: 45
    },
    userAgent: {
      type: String,
      maxlength: 500
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      maxlength: 10
    },
    endpoint: {
      type: String,
      maxlength: 200
    },
    requestId: {
      type: String,
      maxlength: 100
    },
    sessionId: {
      type: String,
      maxlength: 100
    },
    device: {
      type: String,
      maxlength: 100
    },
    browser: {
      type: String,
      maxlength: 100
    },
    os: {
      type: String,
      maxlength: 100
    },
    location: {
      country: String,
      city: String,
      region: String
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['data_change', 'user_action', 'system_event', 'security_event', 'error_event'],
    default: 'data_change'
  },
  isSystemGenerated: {
    type: Boolean,
    default: true
  },
  isSuccessful: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    maxlength: 500
  },
  duration: {
    type: Number // in milliseconds
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  retentionDate: {
    type: Date,
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  versionKey: true
});

// Indexes for better query performance
activitySchema.index({ activityId: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ operation: 1 });
activitySchema.index({ entityType: 1 });
activitySchema.index({ entityId: 1 });
activitySchema.index({ userId: 1 });
activitySchema.index({ userRole: 1 });
activitySchema.index({ severity: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ isArchived: 1 });
activitySchema.index({ retentionDate: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ 'metadata.ipAddress': 1 });

// Compound indexes
activitySchema.index({ type: 1, operation: 1 });
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userRole: 1, createdAt: -1 });
activitySchema.index({ isArchived: 1, retentionDate: 1 });
activitySchema.index({ category: 1, severity: 1 });

// Text index for search functionality
activitySchema.index({
  action: 'text',
  description: 'text',
  details: 'text',
  entityName: 'text',
  userName: 'text'
});

// Pre-save middleware to generate activityId and set retention date
activitySchema.pre('save', async function(next) {
  if (this.isNew) {
    if (!this.activityId) {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      this.activityId = `ACT-${year}${month}-${String(count + 1).padStart(6, '0')}`;
    }
    
    if (!this.retentionDate) {
      // Default 7 days retention, but this should be configurable
      const retentionDays = 7; // This will be configurable via settings
      this.retentionDate = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

// Virtual for checking if activity should be archived
activitySchema.virtual('shouldArchive').get(function() {
  return new Date() >= this.retentionDate && !this.isArchived;
});

// Static methods for comprehensive activity management
activitySchema.statics.logActivity = async function(activityData) {
  try {
    const activity = new this(activityData);
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
};

activitySchema.statics.getActivitiesForSuperAdmin = function(filters = {}) {
  const query = { isArchived: false };
  
  if (filters.type) query.type = filters.type;
  if (filters.operation) query.operation = filters.operation;
  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.userId) query.userId = filters.userId;
  if (filters.severity) query.severity = filters.severity;
  if (filters.category) query.category = filters.category;
  
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email role')
    .populate('clientId', 'firstName lastName email')
    .populate('agentId', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

activitySchema.statics.archiveExpiredActivities = async function() {
  const expiredActivities = await this.find({
    retentionDate: { $lte: new Date() },
    isArchived: false
  });
  
  if (expiredActivities.length > 0) {
    await this.updateMany(
      { _id: { $in: expiredActivities.map(a => a._id) } },
      { isArchived: true }
    );
  }
  
  return expiredActivities.length;
};

activitySchema.statics.getActivityStats = function(timeframe = '24h') {
  const now = new Date();
  let timeAgo;
  
  switch (timeframe) {
    case '1h':
      timeAgo = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      timeAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      timeAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      timeAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      timeAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: timeAgo },
        isArchived: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byType: {
          $push: {
            type: '$type',
            operation: '$operation',
            severity: '$severity'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Activity', activitySchema);
