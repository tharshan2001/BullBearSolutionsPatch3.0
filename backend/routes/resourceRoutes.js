import express from 'express';
import {
  getAllResources,
  createResource,
  getResourceById,
  deleteResource,
} from '../controllers/resourceController.js';

import { protect, protectAdmin } from '../middleware/protect.js';

const router = express.Router();

//user
router.get('/',protect, getAllResources);


// Protected routes (user login required)
router.post('/', protectAdmin, createResource);
// router.get('/:id', protect, getResourceById);

router.delete('/:id', protectAdmin, deleteResource);
router.get('/getAdmin',protectAdmin, getAllResources);
router.delete('/:id', protectAdmin, deleteResource);

export default router;
