import express from 'express';
import {
  getNotifications,
  removeNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

router.get('/',protect, getNotifications); 
router.delete('/:id',protect,removeNotification); 


export default router;
