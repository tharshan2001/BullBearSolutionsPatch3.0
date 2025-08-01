import express from 'express';
import {
  createTempUser,
  verifyTempOtp,
} from '../controllers/tempUserController.js';

const router = express.Router();

// TempUser OTP routes
router.post('/send-otp', createTempUser);
router.post('/verify-otp', verifyTempOtp);


export default router;
