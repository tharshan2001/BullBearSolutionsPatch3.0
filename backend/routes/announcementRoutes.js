import express from 'express';
import {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementsPaginated,
  showAnnouncement,   
  hideAnnouncement,  
} from '../controllers/announcementController.js';

import upload from '../middleware/uploadFiles.js';
import { protectAdmin } from '../middleware/protect.js';
import { protect } from '../middleware/protect.js';

const router = express.Router();

// Create announcement - 1 image + multiple files
router.post(
  '/',
  protectAdmin,
  upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'files', maxCount: 5 },
  ]),
  createAnnouncement
);

// Update announcement - optional new image/files
router.put(
  '/:id',
  protectAdmin,
  upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'files', maxCount: 5 },
  ]),
  updateAnnouncement
);

router.delete('/:id', protectAdmin, deleteAnnouncement);
router.get('/', protectAdmin, getAllAnnouncements);
router.get('/paginated', protect, getAnnouncementsPaginated);
router.get('/:id', protect, getAnnouncementById);

// New routes to show/hide announcement (publish/unpublish)
router.patch('/:id/show', protectAdmin, showAnnouncement);
router.patch('/:id/hide', protectAdmin, hideAnnouncement);

export default router;
