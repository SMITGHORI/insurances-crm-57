
const mongoose = require('mongoose');
const { Schema } = mongoose;

const followUpSchema = new Schema({
  followUpId: {
    type: String,
    unique: true,
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  policyId: {
    type: Schema.Types.ObjectId,
    ref: 'Policy',
    index: true
  },
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  interactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Interaction',
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'quote_follow_up', 'renewal_reminder', 'claim_check', 'policy_review', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  scheduledDate: {
    type: Date,
    required: true,
    index: true
  },
  scheduledTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: {
    type: Number, // in minutes
    default: 30,
    min: 15,
    max: 480
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'],
    default: 'scheduled',
    index: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  completionNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  outcome: {
    type: String,
    enum: ['successful', 'reschedule_needed', 'not_interested', 'follow_up_needed', 'converted'],
    required: function() {
      return this.status === 'completed';
    }
  },
  nextFollowUpDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
followUpSchema.index({ scheduledDate: 1, status: 1 });
followUpSchema.index({ agentId: 1, scheduledDate: 1 });
followUpSchema.index({ clientId: 1, scheduledDate: -1 });
followUpSchema.index({ priority: 1, scheduledDate: 1 });
followUpSchema.index({ status: 1, scheduledDate: 1 });

// Text index for search
followUpSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Pre-save middleware to generate followUpId
followUpSchema.pre('save', async function(next) {
  if (this.isNew && !this.followUpId) {
    const count = await this.constructor.countDocuments();
    this.followUpId = `FU${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for full scheduled datetime
followUpSchema.virtual('scheduledDateTime').get(function() {
  if (!this.scheduledDate || !this.scheduledTime) return null;
  const [hours, minutes] = this.scheduledTime.split(':');
  const dateTime = new Date(this.scheduledDate);
  dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return dateTime;
});

// Virtual for time until follow-up
followUpSchema.virtual('timeUntilFollowUp').get(function() {
  const scheduledDateTime = this.scheduledDateTime;
  if (!scheduledDateTime) return null;
  
  const now = new Date();
  const diffMs = scheduledDateTime - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `${diffDays} days`;
});

// Static methods
followUpSchema.statics.findByAgent = function(agentId, status = null) {
  const query = { agentId };
  if (status) query.status = status;
  return this.find(query).sort({ scheduledDate: 1, scheduledTime: 1 });
};

followUpSchema.statics.findByClient = function(clientId) {
  return this.find({ clientId }).sort({ scheduledDate: -1 });
};

followUpSchema.statics.findDueToday = function(agentId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const query = {
    scheduledDate: { $gte: today, $lt: tomorrow },
    status: 'scheduled'
  };
  
  if (agentId) query.agentId = agentId;
  
  return this.find(query)
    .populate('clientId', 'displayName email phone')
    .sort({ scheduledTime: 1 });
};

followUpSchema.statics.findOverdue = function(agentId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const query = {
    scheduledDate: { $lt: today },
    status: 'scheduled'
  };
  
  if (agentId) query.agentId = agentId;
  
  return this.find(query)
    .populate('clientId', 'displayName email phone')
    .sort({ scheduledDate: 1 });
};

module.exports = mongoose.model('FollowUp', followUpSchema);
