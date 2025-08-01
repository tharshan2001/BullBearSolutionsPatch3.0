import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const TempUser = mongoose.model('TempUser', tempUserSchema);
export default TempUser;
