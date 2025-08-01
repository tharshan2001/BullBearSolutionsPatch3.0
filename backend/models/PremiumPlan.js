// models/PremiumPlan.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const premiumPlanSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  prices: {
    yearly: {
      type: Number,
      required: true,
    },
  },
  features: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
});

premiumPlanSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const PremiumPlan = model('PremiumPlan', premiumPlanSchema);

export default PremiumPlan;
