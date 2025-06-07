
const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Call', 'Email', 'Meeting', 'SMS', 'WhatsApp'],
    required: true
  },
  outcome: {
    type: String,
    required: true,
    maxlength: 1000
  },
  nextAction: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const leadSchema = new mongoose.Schema({
  leadId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s\-\(\)]{10,15}$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  address: {
    type: String,
    maxlength: 500
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Event', 'Advertisement', 'Other'],
    required: true
  },
  product: {
    type: String,
    enum: ['Health Insurance', 'Life Insurance', 'Motor Insurance', 'Home Insurance', 'Travel Insurance', 'Business Insurance'],
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Qualified', 'Not Interested', 'Converted', 'Lost'],
    default: 'New'
  },
  budget: {
    type: Number,
    min: 0,
    max: 10000000
  },
  assignedTo: {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    }
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  additionalInfo: {
    type: String,
    maxlength: 1000
  },
  followUps: [followUpSchema],
  notes: [noteSchema],
  nextFollowUp: {
    type: Date
  },
  lastInteraction: {
    type: Date
  },
  convertedToClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  customFields: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  versionKey: true
});

// Indexes for better query performance
leadSchema.index({ leadId: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ product: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ 'assignedTo.agentId': 1 });
leadSchema.index({ nextFollowUp: 1 });
leadSchema.index({ lastInteraction: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ updatedAt: -1 });

// Compound indexes
leadSchema.index({ status: 1, priority: 1 });
leadSchema.index({ 'assignedTo.agentId': 1, status: 1 });
leadSchema.index({ source: 1, createdAt: -1 });

// Text index for search functionality
leadSchema.index({
  name: 'text',
  email: 'text',
  phone: 'text',
  leadId: 'text',
  additionalInfo: 'text'
});

// Pre-save middleware to generate leadId
leadSchema.pre('save', async function(next) {
  if (this.isNew && !this.leadId) {
    const count = await this.constructor.countDocuments();
    this.leadId = `LD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for follow-up count
leadSchema.virtual('followUpCount').get(function() {
  return this.followUps ? this.followUps.length : 0;
});

// Virtual for notes count
leadSchema.virtual('notesCount').get(function() {
  return this.notes ? this.notes.length : 0;
});

// Methods
leadSchema.methods.addFollowUp = function(followUpData) {
  this.followUps.push(followUpData);
  this.lastInteraction = new Date();
  return this.save();
};

leadSchema.methods.addNote = function(noteData) {
  this.notes.push(noteData);
  return this.save();
};

leadSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.lastInteraction = new Date();
  return this.save();
};

leadSchema.methods.assignToAgent = function(agentId, agentName) {
  this.assignedTo = { agentId, name: agentName };
  return this.save();
};

// Static methods
leadSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

leadSchema.statics.findByAgent = function(agentId) {
  return this.find({ 'assignedTo.agentId': agentId });
};

leadSchema.statics.findDueForFollowUp = function() {
  return this.find({
    nextFollowUp: { $lte: new Date() },
    status: { $in: ['New', 'In Progress', 'Qualified'] }
  });
};

module.exports = mongoose.model('Lead', leadSchema);
