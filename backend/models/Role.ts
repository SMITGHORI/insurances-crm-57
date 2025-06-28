
import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the Permission interface
interface IPermission {
  module: 'clients' | 'leads' | 'quotations' | 'policies' | 'claims' | 'invoices' | 'agents' | 'reports' | 'settings' | 'activities' | 'offers';
  actions: ('view' | 'create' | 'edit' | 'delete' | 'export' | 'approve' | 'edit_sensitive' | 'edit_status')[];
}

// Define the Role interface
interface IRole extends Document {
  name: 'agent' | 'manager' | 'admin' | 'super_admin';
  displayName: string;
  permissions: IPermission[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissionCount: number; // Virtual
}

// Define the Role model interface with statics
interface IRoleModel extends Model<IRole> {
  getDefaultRoles(): Promise<IRole[]>;
}

// Define the permission schema
const permissionSchema = new Schema<IPermission>({
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
const roleSchema = new Schema<IRole>({
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
roleSchema.pre<IRole>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for permission count
roleSchema.virtual('permissionCount').get(function(this: IRole) {
  return this.permissions.reduce((acc, p) => acc + p.actions.length, 0);
});

// Static method to get default roles
roleSchema.statics.getDefaultRoles = function(): Promise<IRole[]> {
  return this.find({ isDefault: true });
};

// Ensure virtuals are included in JSON output
roleSchema.set('toJSON', { virtuals: true });
roleSchema.set('toObject', { virtuals: true });

// Create and export the Role model
const Role = mongoose.model<IRole, IRoleModel>('Role', roleSchema);

export default Role;
export { IRole, IPermission };
