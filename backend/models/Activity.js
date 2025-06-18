
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
    trim: true
  },
  type: {
    type: String,
    enum: ['client', 'policy', 'claim', 'quotation', 'lead', 'agent', 'user', 'payment', 'document'],
    required: true
  },
  operation: {
    type: String,
    enum: ['create', 'read', 'update', 'delete'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['super_admin', 'manager', 'agent'],
    required: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    method: String,
    endpoint: String
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }
}, {
  timestamps: true
});

// Indexes for better performance
activitySchema.index({ activityId: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ userId: 1 });
activitySchema.index({ createdAt: -1 });

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

// Static method for logging activities
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

module.exports = mongoose.model('Activity', activitySchema);
