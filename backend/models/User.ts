
import mongoose, { Document, Schema } from 'mongoose';
import { IRole } from './Role';

// Define the User interface
interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: mongoose.Types.ObjectId | IRole;
  branch: 'main' | 'north' | 'south' | 'east' | 'west';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  flatPermissions: string[]; // Virtual
}

// Define the user schema
const userSchema = new Schema<IUser>({
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
    minlength: 6
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
userSchema.pre<IUser>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for flattened permissions
userSchema.virtual('flatPermissions').get(function(this: IUser) {
  if (!this.role || typeof this.role === 'string') return [];
  
  const roleDoc = this.role as IRole;
  if (!roleDoc.permissions) return [];
  
  return roleDoc.permissions.flatMap(p => 
    p.actions.map(action => `${p.module}:${action}`)
  );
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Create and export the User model
const User = mongoose.model<IUser>('User', userSchema);

export default User;
export { IUser };
