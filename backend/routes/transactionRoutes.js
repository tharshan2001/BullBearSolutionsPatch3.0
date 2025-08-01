import express from "express";
import upload from "../middleware/uploadFiles.js";
import { protect, protectAdmin } from "../middleware/protect.js";
import {
  createDeposit,
  createWithdrawal,
  transferAmount,
  swapUsdtToCw,
  getTransactionById,
  getAllTransactions,
  getMyTransactions,
  approveDeposit,
  approveWithdrawal,
  rejectTransaction, 
} from "../controllers/transactionController.js";

import { checkSecurityPin } from '../middleware/checkSecurityPin.js';
import { checkPremiumStatus } from '../middleware/checkPremiumStatus.js';

const router = express.Router();

// User routes
router.post("/deposit", protect, upload.array("files"), checkSecurityPin, createDeposit);
router.post("/withdraw", protect, checkSecurityPin, checkPremiumStatus, createWithdrawal);
router.post("/transfer", protect, checkSecurityPin, transferAmount);
router.post("/swap", protect,checkSecurityPin, swapUsdtToCw);
router.get("/my-transactions", protect, getMyTransactions);
router.get("/transactions/:id", protect, getTransactionById);

// Admin routes
router.get("/transactions", protectAdmin, getAllTransactions);
router.patch("/:transactionId/approve-deposit", protectAdmin, approveDeposit);
router.patch("/:transactionId/approve-withdrawal", protectAdmin, approveWithdrawal);
router.patch("/:transactionId/reject", protectAdmin, rejectTransaction);

export default router;
