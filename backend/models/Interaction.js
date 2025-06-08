
const mongoose = require('mongoose');
const { Schema } = mongoose;

const interactionSchema = new Schema({
  interactionId: {
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
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'whatsapp', 'sms', 'visit', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  outcome: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'follow_up_needed', 'no_response'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  interactionDate: {
    type: Date,
    required: true,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    index: true
  },
  followUpNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['completed', 'follow_up_scheduled', 'closed'],
    default: 'completed'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
interactionSchema.index({ clientId: 1, interactionDate: -1 });
interactionSchema.index({ agentId: 1, interactionDate: -1 });
interactionSchema.index({ type: 1, outcome: 1 });
interactionSchema.index({ followUpDate: 1, followUpRequired: 1 });
interactionSchema.index({ createdAt: -1 });

// Text index for search
interactionSchema.index({
  subject: 'text',
  description: 'text',
  notes: 'text',
  tags: 'text'
});

// Pre-save middleware to generate interactionId
interactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.interactionId) {
    const count = await this.constructor.countDocuments();
    this.interactionId = `INT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for days until follow-up
interactionSchema.virtual('daysUntilFollowUp').get(function() {
  if (!this.followUpDate) return null;
  const today = new Date();
  const followUp = new Date(this.followUpDate);
  const diffTime = followUp - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static methods
interactionSchema.statics.findByClient = function(clientId) {
  return this.find({ clientId }).sort({ interactionDate: -1 });
};

interactionSchema.statics.findByAgent = function(agentId) {
  return this.find({ agentId }).sort({ interactionDate: -1 });
};

interactionSchema.statics.findUpcomingFollowUps = function(agentId, days = 7) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  const query = {
    followUpRequired: true,
    followUpDate: { $lte: endDate },
    status: 'follow_up_scheduled'
  };
  
  if (agentId) query.agentId = agentId;
  
  return this.find(query)
    .populate('clientId', 'displayName email phone')
    .sort({ followUpDate: 1 });
};

module.exports = mongoose.model('Interaction', interactionSchema);
