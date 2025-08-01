import express from 'express';
import { protect } from '../middleware/protect.js';
import { getReferralGraphHandler } from '../controllers/referralController.js';
import { checkPremiumStatus } from '../middleware/checkPremiumStatus.js';

const router = express.Router();

// Protected route: Get referral graph for logged-in user
router.get('/graph', protect,checkPremiumStatus, getReferralGraphHandler);



export default router;
