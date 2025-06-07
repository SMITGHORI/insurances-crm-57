
const mongoose = require('mongoose');

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
    enum: ['client', 'policy', 'claim', 'quotation', 'lead', 'payment', 'document', 'commission', 'reminder', 'system'],
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
    enum: ['client', 'policy', 'claim', 'quotation', 'lead', 'agent', 'user'],
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
    ref: 'User',
    required: true
  },
  agentName: {
    type: String,
    required: true,
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
  metadata: {
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Policy'
    },
    policyNumber: {
      type: String,
      maxlength: 50
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim'
    },
    claimNumber: {
      type: String,
      maxlength: 50
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation'
    },
    quoteId: {
      type: String,
      maxlength: 50
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    amount: {
      type: Number,
      min: 0
    },
    oldValue: {
      type: String,
      maxlength: 500
    },
    newValue: {
      type: String,
      maxlength: 500
    },
    ipAddress: {
      type: String,
      maxlength: 45
    },
    userAgent: {
      type: String,
      maxlength: 500
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'hidden'],
    default: 'active'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  isSystemGenerated: {
    type: Boolean,
    default: false
  },
  isVisible: {
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
  versionKey: true
});

// Indexes for better query performance
activitySchema.index({ activityId: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ entityType: 1 });
activitySchema.index({ entityId: 1 });
activitySchema.index({ clientId: 1 });
activitySchema.index({ agentId: 1 });
activitySchema.index({ userId: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ priority: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ updatedAt: -1 });

// Compound indexes
activitySchema.index({ type: 1, agentId: 1 });
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ status: 1, createdAt: -1 });
activitySchema.index({ agentId: 1, createdAt: -1 });
activitySchema.index({ clientId: 1, createdAt: -1 });
activitySchema.index({ type: 1, status: 1, createdAt: -1 });

// Text index for search functionality
activitySchema.index({
  action: 'text',
  description: 'text',
  details: 'text',
  entityName: 'text',
  clientName: 'text',
  agentName: 'text',
  userName: 'text'
});

// Pre-save middleware to generate activityId
activitySchema.pre('save', async function(next) {
  if (this.isNew && !this.activityId) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    this.activityId = `ACT-${year}${month}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for checking if activity is recent (within last 24 hours)
activitySchema.virtual('isRecent').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt >= oneDayAgo;
});

// Virtual for time ago display
activitySchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
});

// Methods
activitySchema.methods.archive = function() {
  this.status = 'archived';
  this.updatedBy = this.userId;
  return this.save();
};

activitySchema.methods.hide = function() {
  this.isVisible = false;
  this.updatedBy = this.userId;
  return this.save();
};

activitySchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

activitySchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static methods
activitySchema.statics.findByType = function(type) {
  return this.find({ type, status: 'active', isVisible: true });
};

activitySchema.statics.findByAgent = function(agentId) {
  return this.find({ agentId, status: 'active', isVisible: true });
};

activitySchema.statics.findByClient = function(clientId) {
  return this.find({ clientId, status: 'active', isVisible: true });
};

activitySchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({ entityType, entityId, status: 'active', isVisible: true });
};

activitySchema.statics.findRecent = function(hours = 24) {
  const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ 
    createdAt: { $gte: timeAgo },
    status: 'active',
    isVisible: true
  }).sort({ createdAt: -1 });
};

activitySchema.statics.getActivityStats = function(agentId, startDate, endDate) {
  const matchQuery = {
    status: 'active',
    isVisible: true
  };
  
  if (agentId) matchQuery.agentId = mongoose.Types.ObjectId(agentId);
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        recentCount: {
          $sum: {
            $cond: [
              { $gte: ['$createdAt', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        totalRecent: { $sum: '$recentCount' },
        byType: {
          $push: {
            type: '$_id',
            count: '$count',
            recentCount: '$recentCount'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Activity', activitySchema);
