import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const adminSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'editor'],
    default: 'admin',
  },
}, {
  timestamps: true,
});

// Prevent multiple superadmins
adminSchema.pre('save', async function (next) {
  if (this.role === 'superadmin') {
    const existingSuperAdmin = await this.constructor.findOne({ role: 'superadmin' });
    if (existingSuperAdmin && existingSuperAdmin._id.toString() !== this._id.toString()) {
      throw new Error('Super Admin already exists. Cannot create another.');
    }
  }
  next();
});

// Hash password for all roles if modified
adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Password comparison
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Static method to create admin by superadmin
adminSchema.statics.createBySuperAdmin = async function (creatorId, adminData) {
  const creator = await this.findById(creatorId);

  if (!creator || creator.role !== 'superadmin') {
    throw new Error('Only superadmin can create admins');
  }

  if (adminData.role === 'superadmin') {
    throw new Error('Cannot create another superadmin');
  }

  const admin = new this(adminData);
  return await admin.save();
};

const Admin = model('Admin', adminSchema);
export default Admin;
