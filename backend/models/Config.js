import mongoose from "mongoose";

const levelRatesSchema = new mongoose.Schema({}, { _id: false, strict: false });

const configSchema = new mongoose.Schema({
  directCommissionRate: {
    type: Number,
    required: true,
  },
  commissionPercentage: {
    type: Number,
    required: true,
  },
  levelRates: {
    type: levelRatesSchema,
    required: true,
  },
});

const Config = mongoose.models.Config || mongoose.model("Config", configSchema);

export default Config;
