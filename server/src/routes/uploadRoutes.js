/**
 * routes/uploadRoutes.js — /api/upload/*
 *   POST /image   (multipart, admin+)
 */
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { uploadImage } from "../middleware/upload.js";
import * as ctrl from "../controllers/uploadController.js";

const router = Router();

router.post("/image", protect, requireAdmin, uploadImage.single("file"), ctrl.uploadImage);

export default router;
