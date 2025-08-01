import express from 'express';
import { saveNewPlan, getLastSavedPlan } from '../controllers/premiumPlanController.js';
import { protectAdmin,protect } from '../middleware/protect.js';


const router = express.Router();


//admin
router.post('/plans',protectAdmin ,saveNewPlan);
router.get('/plans/last/admin',protectAdmin,getLastSavedPlan);


//user
router.get('/plans/last', protect,getLastSavedPlan);

export default router;
