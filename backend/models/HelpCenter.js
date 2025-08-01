import mongoose from 'mongoose';

const helpCenterSchema = new mongoose.Schema({
  FullName: String,
  mailid: String,
  message: String,
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const HelpCenter = mongoose.model('HelpCenter', helpCenterSchema);

export default HelpCenter;
