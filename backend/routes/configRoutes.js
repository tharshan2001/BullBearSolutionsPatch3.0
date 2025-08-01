import express from "express";
import { getConfig, createConfig, updateConfig ,getAllConfigs, deleteConfig} from "../controllers/configController.js";
import {protectAdmin} from '../middleware/protect.js'


const router = express.Router();

router.get("/",protectAdmin, getConfig);
router.post("/",protectAdmin, createConfig);
router.put("/",protectAdmin, updateConfig);
router.get("/getAll",protectAdmin,getAllConfigs);
router.delete("/:id", protectAdmin, deleteConfig);


export default router;
