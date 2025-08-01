import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'swap'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    enum: ['usdt', 'cw'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled','rejected'],
    default: 'pending',
  },
  description: {
    type: String,
    trim: true,
  },
  referenceId: {
    type: String,
    trim: true,
  },
  adminApproved: {
    type: Boolean,
    default: false,
  },
  adminApprovedAt: {
    type: Date,
    default: null,
  },
  adminApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', 
    default: null,
  },
  network: {
    type: String,
    enum: ['TRC20', 'BEP20'],
    required: function () {
      return this.type === 'withdrawal';
    },
  },
  networkAddress: {
    type: String,
    trim: true,
    required: function () {
      return this.type === 'withdrawal';
    },
  },
  meta: {
    type: Object,
    default: {},
  },
  files: [
    {
      url: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        trim: true,
      },
    },
  ],
}, {
  timestamps: true,
});

// Normalize currency to lowercase before validation
transactionSchema.pre('validate', function (next) {
  if (this.currency) {
    this.currency = this.currency.toLowerCase();
  }
  next();
});

transactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
