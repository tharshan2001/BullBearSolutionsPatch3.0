import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  nic: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  securityPin: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    minlength: 24,
    maxlength: 24,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 20,
  },
  references: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  wallet: {
    usdt: {
      type: Number,
      default: 0,
    },
    cw: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  sales: {
    personalSales: {
      type: Number,
      default: 0,
    },
    directSponsorSales: {
      type: Number,
      default: 0,
    },
    groupSales: {
      type: Number,
      default: 0,
    },
  },
  premium: {
    active: {
      type: Boolean,
      default: false,
    },
    activatedDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.code && this._id) {
    this.code = this._id.toString();
  }
  next();
});

userSchema.index({ code: 1 }, { unique: true });
userSchema.index({ referredBy: 1 });

const User = mongoose.model('User', userSchema);
export default User;
