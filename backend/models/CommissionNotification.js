// models/CommissionNotification.js
import mongoose from 'mongoose';

const CommissionNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['direct', 'level', 'root', 'unclaimed'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  sourceUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  level: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['paid', 'unclaimed_processed'],
    default: 'paid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
    default: ''
  }
});

export default mongoose.model('CommissionNotification', CommissionNotificationSchema);
