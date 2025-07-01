const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['main', 'north', 'south', 'east', 'west'],
    default: 'main'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-find hook to populate role
userSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'role',
    select: 'name displayName permissions'
  });
  next();
});

// Pre-save hook to update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for flattened permissions
userSchema.virtual('flatPermissions').get(function() {
  if (!this.role || typeof this.role === 'string') return [];
  
  const roleDoc = this.role;
  if (!roleDoc.permissions) return [];
  
  return roleDoc.permissions.flatMap(p => 
    p.actions.map(action => `${p.module}:${action}`)
  );
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(module, action) {
  if (!this.role || !this.role.permissions) return false;
  
  const modulePermission = this.role.permissions.find(p => p.module === module);
  return modulePermission && modulePermission.actions.includes(action);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;