import express from 'express';
import {
  createMessage,
  getAllMessages,
  markAsRead,
  deleteMessage
} from '../controllers/helpCenterController.js';
import { protect, protectAdmin } from '../middleware/protect.js';

const router = express.Router();

router.post('/',protect, createMessage);         
router.get('/',protectAdmin, getAllMessages);         
router.patch('/:id/read',protectAdmin, markAsRead);   
router.delete('/:id',protectAdmin, deleteMessage);    

export default router;
