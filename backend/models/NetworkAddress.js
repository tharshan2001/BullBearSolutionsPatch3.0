// models/NetworkAddresses.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const networkAddressSchema = new Schema({
  TRC20: { type: String, default: null },
  BEP20: { type: String, default: null },
  ERC20: { type: String, default: null },
  SOL:   { type: String, default: null },
  AVAX:  { type: String, default: null },
  MATIC: { type: String, default: null },
  label: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const NetworkAddresses = model('NetworkAddresses', networkAddressSchema);

export default NetworkAddresses;
