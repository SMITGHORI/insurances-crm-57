const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the permission schema
const permissionSchema = new Schema({
  module: {
    type: String,
    required: true,
    enum: ['clients', 'leads', 'quotations', 'policies', 'claims', 'invoices', 'agents', 'reports', 'settings', 'activities', 'offers']
  },
  actions: [{
    type: String,
    enum: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'edit_sensitive', 'edit_status'],
    required: true
  }]
}, { _id: false });

// Define the main role schema
const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['agent', 'manager', 'admin', 'super_admin'],
    index: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  permissions: [permissionSchema],
  isDefault: {
    type: Boolean,
    default: false
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

// Pre-save hook to update timestamp
roleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for permission count
roleSchema.virtual('permissionCount').get(function() {
  return this.permissions ? this.permissions.reduce((acc, p) => acc + (p.actions ? p.actions.length : 0), 0) : 0;
});

// Static method to get default roles
roleSchema.statics.getDefaultRoles = function() {
  return this.find({ isDefault: true });
};

// Ensure virtuals are included in JSON output
roleSchema.set('toJSON', { virtuals: true });
roleSchema.set('toObject', { virtuals: true });

// Create and export the Role model
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;