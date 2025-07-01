
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     FollowUp:
 *       type: object
 *       required:
 *         - date
 *         - time
 *         - type
 *         - outcome
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the follow-up
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the follow-up
 *           example: "2024-01-15"
 *         time:
 *           type: string
 *           description: Time of the follow-up
 *           example: "10:00"
 *         type:
 *           type: string
 *           enum: [Call, Email, Meeting, SMS, WhatsApp]
 *           description: Type of follow-up communication
 *           example: "Call"
 *         outcome:
 *           type: string
 *           maxLength: 1000
 *           description: Result or outcome of the follow-up
 *           example: "Customer showed interest, scheduled another call"
 *         nextAction:
 *           type: string
 *           maxLength: 500
 *           description: Next action to be taken
 *           example: "Send insurance quotes via email"
 *         createdBy:
 *           type: string
 *           description: Name of the person who created the follow-up
 *           example: "Agent Smith"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the follow-up was created
 *     
 *     Note:
 *       type: object
 *       required:
 *         - content
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the note
 *         content:
 *           type: string
 *           maxLength: 2000
 *           description: Content of the note
 *           example: "Customer prefers comprehensive health insurance coverage"
 *         createdBy:
 *           type: string
 *           description: Name of the person who created the note
 *           example: "Agent Smith"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the note was created
 *     
 *     LeadAssignment:
 *       type: object
 *       properties:
 *         agentId:
 *           type: string
 *           description: MongoDB ObjectId of the assigned agent
 *           example: "507f1f77bcf86cd799439012"
 *         name:
 *           type: string
 *           description: Name of the assigned agent
 *           example: "Agent Smith"
 *     
 *     Lead:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - email
 *         - source
 *         - product
 *         - assignedTo
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique MongoDB ObjectId
 *           example: "507f1f77bcf86cd799439011"
 *         leadId:
 *           type: string
 *           description: Auto-generated unique lead identifier
 *           example: "LD000001"
 *         name:
 *           type: string
 *           maxLength: 100
 *           description: Full name of the lead
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           pattern: '^\+?[\d\s\-\(\)]{10,15}$'
 *           description: Phone number of the lead
 *           example: "+1234567890"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the lead
 *           example: "john.doe@email.com"
 *         address:
 *           type: string
 *           maxLength: 500
 *           description: Physical address of the lead
 *           example: "123 Main St, City, State 12345"
 *         source:
 *           type: string
 *           enum: [Website, Referral, Cold Call, Social Media, Event, Advertisement, Other]
 *           description: Source from which the lead was generated
 *           example: "Website"
 *         product:
 *           type: string
 *           enum: [Health Insurance, Life Insurance, Motor Insurance, Home Insurance, Travel Insurance, Business Insurance]
 *           description: Type of insurance product the lead is interested in
 *           example: "Health Insurance"
 *         status:
 *           type: string
 *           enum: [New, In Progress, Qualified, Not Interested, Converted, Lost]
 *           description: Current status of the lead
 *           example: "New"
 *           default: "New"
 *         budget:
 *           type: number
 *           minimum: 0
 *           maximum: 10000000
 *           description: Budget range of the lead
 *           example: 5000
 *         assignedTo:
 *           $ref: '#/components/schemas/LeadAssignment'
 *         priority:
 *           type: string
 *           enum: [High, Medium, Low]
 *           description: Priority level of the lead
 *           example: "Medium"
 *           default: "Medium"
 *         additionalInfo:
 *           type: string
 *           maxLength: 1000
 *           description: Additional information about the lead
 *           example: "Customer is interested in family health insurance"
 *         followUps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FollowUp'
 *           description: Array of follow-up activities
 *         notes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Note'
 *           description: Array of notes related to the lead
 *         nextFollowUp:
 *           type: string
 *           format: date-time
 *           description: Date and time of the next scheduled follow-up
 *           example: "2024-01-15T10:00:00Z"
 *         lastInteraction:
 *           type: string
 *           format: date-time
 *           description: Date and time of the last interaction with the lead
 *           example: "2024-01-10T14:30:00Z"
 *         convertedToClientId:
 *           type: string
 *           description: MongoDB ObjectId of the client if lead was converted
 *           example: "507f1f77bcf86cd799439015"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             maxLength: 50
 *           description: Tags associated with the lead
 *           example: ["hot-lead", "family-insurance"]
 *         customFields:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Custom fields for additional lead information
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the lead was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the lead was last updated
 */

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
  versionKey: false
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
