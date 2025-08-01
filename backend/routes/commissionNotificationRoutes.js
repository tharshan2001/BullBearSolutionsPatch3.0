// routes/commissionNotificationRoutes.js
import express from "express";
import {
  getCommissionNotificationsByUser,
  createCommissionNotification,
  deleteCommissionNotification,
} from "../controllers/commissionNotificationController.js";

import { protect } from "../middleware/protect.js";

const router = express.Router();

router.get("/", protect, getCommissionNotificationsByUser);
router.post("/", createCommissionNotification);
router.delete("/:id", protect, deleteCommissionNotification);

export default router;
