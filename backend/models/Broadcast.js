
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Broadcast Schema for sending offers and greetings
const broadcastSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['offer', 'festival', 'announcement', 'promotion', 'newsletter', 'reminder']
  },
  channels: [{
    type: String,
    enum: ['email', 'whatsapp'],
    required: true
  }],
  subject: {
    type: String,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  mediaUrl: {
    type: String // For images/videos in broadcasts
  },
  targetAudience: {
    allClients: {
      type: Boolean,
      default: false
    },
    specificClients: [{
      type: Schema.Types.ObjectId,
      ref: 'Client'
    }],
    clientTypes: [{
      type: String,
      enum: ['individual', 'corporate', 'group']
    }],
    tierLevels: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }],
    locations: [{
      city: String,
      state: String
    }]
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  stats: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    sentCount: {
      type: Number,
      default: 0
    },
    deliveredCount: {
      type: Number,
      default: 0
    },
    failedCount: {
      type: Number,
      default: 0
    },
    optedOutCount: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Broadcast Recipients Schema
const broadcastRecipientSchema = new Schema({
  broadcastId: {
    type: Schema.Types.ObjectId,
    ref: 'Broadcast',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  channel: {
    type: String,
    enum: ['email', 'whatsapp'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'opted_out'],
    default: 'pending'
  },
  sentAt: Date,
  deliveredAt: Date,
  errorMessage: String,
  communicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Communication'
  }
}, {
  timestamps: true
});

// Indexes
broadcastSchema.index({ createdBy: 1, createdAt: -1 });
broadcastSchema.index({ status: 1, scheduledAt: 1 });
broadcastSchema.index({ type: 1, status: 1 });

broadcastRecipientSchema.index({ broadcastId: 1, clientId: 1, channel: 1 });
broadcastRecipientSchema.index({ status: 1, sentAt: 1 });

module.exports = {
  Broadcast: mongoose.model('Broadcast', broadcastSchema),
  BroadcastRecipient: mongoose.model('BroadcastRecipient', broadcastRecipientSchema)
};
