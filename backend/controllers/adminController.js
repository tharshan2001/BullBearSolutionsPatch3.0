import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';
import User from "../models/User.js";
import { sendBulkSMS } from "../utils/bulkSms.js";

/**
 * Create admin by super admin
 */
export const createBySuperAdmin = async (req, res) => {
  try {
    const creatorId = req.user?._id;
    if (!creatorId) {
      return res.status(401).json({ message: 'Unauthorized: no creator ID' });
    }

    const { username, email, password, role } = req.body;

    // Basic validations
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username is required and must be at least 3 characters.' });
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Valid email is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password is required and must be at least 8 characters.' });
    }

    const validRoles = ['admin', 'editor'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: `Role is required and must be one of: ${validRoles.join(', ')}` });
    }

    // Check for existing username or email
    const existingUser = await Admin.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use.' });
    }

    const adminData = { username, email, password, role };

    const newAdmin = await Admin.createBySuperAdmin(creatorId, adminData);
    const adminObj = newAdmin.toObject();
    delete adminObj.password;

    res.status(201).json({ success: true, data: adminObj });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

/**
 * Get all admins
 */
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.status(200).json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete admin by ID
 */
export const deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin login
 */
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin);

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: 'strict',
    });

    const adminObj = admin.toObject();
    delete adminObj.password;

    res.status(200).json({ success: true, data: adminObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin logout
 */
export const logoutAdmin = (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * Get current admin profile
 */
export const profile = async (req, res) => {
  try {
    const adminId = req.user?._id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user info found' });
    }

    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Verify token validity
 */
export const verifyToken = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const admin = await Admin.findById(req.user._id).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



