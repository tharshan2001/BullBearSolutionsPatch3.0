import express from 'express';
import {
  createBySuperAdmin,
  getAdmins,
  deleteAdmin,
  loginAdmin,
  logoutAdmin,
  profile,
  verifyToken,
} from '../controllers/adminController.js';

import { protectAdmin } from '../middleware/protect.js';


const router = express.Router();


// Public routes
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);

// Protected routes
router.use(protectAdmin);


router.post('/create-by-superadmin', createBySuperAdmin);
router.get('/', getAdmins);
router.delete('/:id', deleteAdmin);

router.get('/profile', profile); 
router.get('/verify-token', verifyToken);

export default router;
