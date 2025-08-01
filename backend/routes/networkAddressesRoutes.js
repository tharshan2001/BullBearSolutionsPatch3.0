// routes/networkAddressesRoutes.js
import express from 'express';
import { saveNetworkAddresses, getLastNetworkAddresses } from '../controllers/networkAddressesController.js';
import { protect, protectAdmin } from '../middleware/protect.js';

const router = express.Router();

router.post('/',protectAdmin, saveNetworkAddresses);
router.get('/latest',protect, getLastNetworkAddresses);
router.get('/latestAdmin',protectAdmin, getLastNetworkAddresses);

export default router;
