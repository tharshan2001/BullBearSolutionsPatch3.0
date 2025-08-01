import User from '../models/User.js'; 
import bcrypt from 'bcryptjs';

export const checkSecurityPin = async (req, res, next) => {
  try {
    const userId = req.user._id; 
    const { securityPin } = req.body;

    if (!securityPin) {
      return res.status(400).json({ success: false, message: 'Security PIN is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(securityPin, user.securityPin);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid security PIN.' });
    }

    next();
  } catch (error) {
    console.error('Security PIN check error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
