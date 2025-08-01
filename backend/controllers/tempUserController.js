import TempUser from '../models/TempUser.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailHandler.js';


// Inline OTP generator
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


export const createTempUser = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registerd!' });
    }

    const existingTemp = await TempUser.findOne({ email });
    const now = new Date();
    let shouldGenerateNewOtp = true;

    if (existingTemp && existingTemp.otpExpires > now) {
      shouldGenerateNewOtp = false;
    }

    if (!shouldGenerateNewOtp) {
      return res.status(200).json({ message: 'OTP already sent. Please wait until it expires.' });
    }

    const otp = generateOtp();
    const otpExpires = new Date(now.getTime() + 2 * 60 * 1000);

    const tempUser = await TempUser.findOneAndUpdate(
      { email },
      { otp, otpExpires },
      { upsert: true, new: true }
    );

    await sendEmail({
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 2 minutes.</p>`,
    });

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).json({ message: error.message });
  }
};


// Verify OTP for TempUser
export const verifyTempOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(404).json({ message: 'No OTP request found for this email' });
    }

    if (tempUser.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark verified, but keep otp and otpExpires as they are
    tempUser.verified = true;
    await tempUser.save();

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
