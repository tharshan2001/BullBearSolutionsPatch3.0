import express from 'express';
import {
  subscribeToProduct,
  getUserSubscriptions,
  renewSubscription,
  expireSubscription,
  checkUserSubscription,
  getSubscriptionsByUserId,
  updateSubscriptionToActive,
  deactivateSubscription,
  getAllSubscriptions
} from '../controllers/subscriptionController.js';
import { protect, protectAdmin } from '../middleware/protect.js';
import { checkSecurityPin } from '../middleware/checkSecurityPin.js';
import { checkPremiumStatus } from '../middleware/checkPremiumStatus.js';

const router = express.Router();

// User routes
router.post('/subscribe', protect, checkSecurityPin, checkPremiumStatus, subscribeToProduct);
router.get('/', protect, getUserSubscriptions); 
router.patch('/:subscriptionId/renew', protect, renewSubscription);
router.patch('/:subscriptionId/expire', protect, expireSubscription);
router.get('/check/:productId', protect, checkUserSubscription);



// Admin routes
router.patch('/:subscriptionId/activate', protectAdmin, updateSubscriptionToActive);
router.patch('/:subscriptionId/deactivate', protectAdmin, deactivateSubscription);
router.get('/getAll', protectAdmin, getAllSubscriptions);


export default router;