
const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Agent Document Schema
 * Embedded document for agent files and documents
 */
const AgentDocumentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  type: {
    type: String,
    required: true,
    enum: ['license', 'contract', 'certification', 'id_proof', 'address_proof', 'bank_details', 'resume', 'other'],
    default: 'other'
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, { _id: true });

/**
 * Agent Note Schema
 * Embedded document for agent notes and comments
 */
const AgentNoteSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, { _id: true });

/**
 * Personal Information Schema
 * Embedded document for agent personal details
 */
const PersonalInfoSchema = new Schema({
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        return value < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    lowercase: true
  },
  nationality: {
    type: String,
    trim: true,
    maxlength: 100
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', 'separated'],
    lowercase: true
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: 50
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    }
  }
}, { _id: false });

/**
 * Address Schema
 * Embedded document for agent address information
 */
const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'USA'
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  }
}, { _id: false });

/**
 * Bank Details Schema
 * Embedded document for agent banking information
 */
const BankDetailsSchema = new Schema({
  accountNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{8,20}$/.test(v);
      },
      message: 'Account number must be 8-20 digits'
    }
  },
  routingNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{9}$/.test(v);
      },
      message: 'Routing number must be 9 digits'
    }
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings'],
    default: 'checking'
  },
  accountHolderName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  swiftCode: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v);
      },
      message: 'Invalid SWIFT code format'
    }
  }
}, { _id: false });

/**
 * Performance Schema
 * Embedded document for agent performance metrics
 */
const PerformanceSchema = new Schema({
  clientsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  policiesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPremium: {
    type: Number,
    default: 0,
    min: 0
  },
  conversionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  avgDealSize: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyTargets: {
    policies: {
      type: Number,
      default: 0,
      min: 0
    },
    premium: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  quarterlyTargets: {
    policies: {
      type: Number,
      default: 0,
      min: 0
    },
    premium: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  annualTargets: {
    policies: {
      type: Number,
      default: 0,
      min: 0
    },
    premium: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  achievements: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    date: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      enum: ['sales', 'customer_service', 'training', 'leadership', 'other'],
      default: 'sales'
    }
  }],
  lastPerformanceReview: {
    type: Date
  },
  nextPerformanceReview: {
    type: Date
  }
}, { _id: false });

/**
 * Main Agent Schema
 * Complete agent information model
 */
const AgentSchema = new Schema({
  // Basic Information
  agentId: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    },
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Invalid phone number format'
    },
    index: true
  },
  
  // Status and Role Information
  status: {
    type: String,
    enum: ['active', 'inactive', 'onboarding', 'terminated', 'suspended'],
    default: 'onboarding',
    index: true
  },
  role: {
    type: String,
    enum: ['agent', 'senior_agent', 'team_lead', 'manager'],
    default: 'agent'
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    maxlength: 100,
    index: true
  },
  
  // Location and Team Information
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true,
    maxlength: 50,
    index: true
  },
  territory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    index: true
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // License and Certification Information
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'License expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'License expiry date must be in the future'
    },
    index: true
  },
  licenseState: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: 2
  },
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    certificateNumber: {
      type: String,
      trim: true,
      maxlength: 50
    }
  }],
  
  // Employment Information
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now,
    index: true
  },
  terminationDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.hireDate;
      },
      message: 'Termination date must be after hire date'
    }
  },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'commission_only'],
    default: 'full_time'
  },
  
  // Commission and Compensation
  commissionRate: {
    type: Number,
    required: [true, 'Commission rate is required'],
    min: [0, 'Commission rate cannot be negative'],
    max: [100, 'Commission rate cannot exceed 100%'],
    index: true
  },
  baseSalary: {
    type: Number,
    min: 0,
    default: 0
  },
  commissionStructure: {
    type: String,
    enum: ['flat_rate', 'tiered', 'performance_based'],
    default: 'flat_rate'
  },
  
  // Contact and Personal Information
  personalInfo: PersonalInfoSchema,
  address: {
    type: AddressSchema,
    required: [true, 'Address is required']
  },
  bankDetails: BankDetailsSchema,
  
  // Performance and Metrics
  performance: {
    type: PerformanceSchema,
    default: () => ({})
  },
  
  // Professional Information
  education: [{
    degree: {
      type: String,
      trim: true,
      maxlength: 100
    },
    institution: {
      type: String,
      trim: true,
      maxlength: 100
    },
    graduationYear: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear()
    },
    field: {
      type: String,
      trim: true,
      maxlength: 100
    }
  }],
  experience: [{
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }],
  
  // Embedded Collections
  documents: [AgentDocumentSchema],
  notes: [AgentNoteSchema],
  
  // System Fields
  avatar: {
    type: String,
    trim: true
  },
  lastLoginAt: {
    type: Date
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Audit Fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Hide sensitive information
      if (ret.bankDetails && ret.bankDetails.accountNumber) {
        ret.bankDetails.accountNumber = '****' + ret.bankDetails.accountNumber.slice(-4);
      }
      if (ret.bankDetails && ret.bankDetails.routingNumber) {
        ret.bankDetails.routingNumber = '****' + ret.bankDetails.routingNumber.slice(-4);
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
AgentSchema.index({ name: 'text', email: 'text', phone: 'text' });
AgentSchema.index({ status: 1, specialization: 1 });
AgentSchema.index({ region: 1, teamId: 1 });
AgentSchema.index({ licenseExpiry: 1 });
AgentSchema.index({ hireDate: -1 });
AgentSchema.index({ 'performance.totalPremium': -1 });
AgentSchema.index({ isDeleted: 1, status: 1 });

// Virtual fields
AgentSchema.virtual('fullName').get(function() {
  return this.name;
});

AgentSchema.virtual('age').get(function() {
  if (this.personalInfo && this.personalInfo.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.personalInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

AgentSchema.virtual('yearsOfService').get(function() {
  if (this.hireDate) {
    const today = new Date();
    const hireDate = new Date(this.hireDate);
    return Math.floor((today - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
  }
  return 0;
});

AgentSchema.virtual('isLicenseExpiringSoon').get(function() {
  if (this.licenseExpiry) {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return this.licenseExpiry <= thirtyDaysFromNow;
  }
  return false;
});

// Pre-save middleware
AgentSchema.pre('save', async function(next) {
  try {
    // Generate agent ID if not provided
    if (!this.agentId && this.isNew) {
      const count = await this.constructor.countDocuments({});
      this.agentId = `AGT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    }
    
    // Update performance metrics if changed
    if (this.isModified('performance')) {
      if (this.performance.clientsCount > 0 && this.performance.policiesCount > 0) {
        this.performance.conversionRate = (this.performance.policiesCount / this.performance.clientsCount) * 100;
      }
      if (this.performance.policiesCount > 0 && this.performance.totalPremium > 0) {
        this.performance.avgDealSize = this.performance.totalPremium / this.performance.policiesCount;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static methods
AgentSchema.statics.findActive = function() {
  return this.find({ status: 'active', isDeleted: false });
};

AgentSchema.statics.findByRegion = function(region) {
  return this.find({ region, isDeleted: false });
};

AgentSchema.statics.findExpiringLicenses = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    licenseExpiry: { $lte: futureDate },
    status: { $ne: 'terminated' },
    isDeleted: false
  });
};

// Instance methods
AgentSchema.methods.addNote = function(content, createdBy, options = {}) {
  this.notes.push({
    content,
    createdBy,
    isPrivate: options.isPrivate || false,
    tags: options.tags || [],
    priority: options.priority || 'medium'
  });
  return this.save();
};

AgentSchema.methods.updatePerformance = function(metrics) {
  Object.assign(this.performance, metrics);
  return this.save();
};

AgentSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.status = 'terminated';
  return this.save();
};

module.exports = mongoose.model('Agent', AgentSchema);
