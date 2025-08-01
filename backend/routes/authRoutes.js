import express from 'express';
import {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  getProfile,
  logoutUser,
  testRegisterUser,
  getWalletDetails,
  upgradePremium,
  resetPassword,
  resetSecurityPin,
  resetPasswordWithOld,
  getUserById,
  updateUserById
} from '../controllers/authController.js';
import { protect,protectAdmin } from '../middleware/protect.js';

const router = express.Router();


//Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser);
router.post("/reset-password", resetPassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

//test
router.post('/register/test', testRegisterUser);

// Profile route - protected
router.get('/profile', protect,getProfile);
router.get("/wallet", protect, getWalletDetails);
router.post('/upgrade-premium', protect, upgradePremium);
router.post("/reset-pin", protect, resetSecurityPin);
router.post("/reset-password-old", protect, resetPasswordWithOld);


//
router.get("/admin/users/:id", protectAdmin, getUserById);
router.put("/admin/users/:id", protectAdmin, updateUserById);


export default router;
