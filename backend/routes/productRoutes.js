import express from 'express';
import {
  createProduct,
  getAllProducts,
  getVisibleProducts,  
  getProductBySlug,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
} from '../controllers/productController.js';

import { protect } from '../middleware/protect.js';
// Optional: middleware to restrict certain actions to admins
import { protectAdmin } from '../middleware/protect.js';
import upload from '../middleware/uploadImage.js'; 

const router = express.Router();


// Protected routes (require login)
router.get('/available', protect, getVisibleProducts);
router.get('/:slug', protect, getProductBySlug);


//admin
router.get('/', protectAdmin, getAllProducts);
router.post('/create', protectAdmin, upload.single('image'), createProduct);
router.put('/update/:id', protectAdmin, updateProduct);
router.delete('/delete/:id', protectAdmin, deleteProduct);
router.patch('/enable/:id', protectAdmin, toggleProductVisibility);



export default router;
