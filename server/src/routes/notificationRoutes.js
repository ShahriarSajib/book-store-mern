/**
 * routes/notificationRoutes.js — /api/notifications/*
 *   GET /, POST /:id/read, POST /read-all, DELETE /:id, DELETE / (clear)
 *   GET /preferences, PUT /preferences
 */
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import * as ctrl from "../controllers/notificationController.js";

const router = Router();

router.use(protect);

router.get("/", ctrl.list);
router.post("/:id/read", ctrl.markAsRead);
router.post("/read-all", ctrl.markAllAsRead);
router.delete("/:id", ctrl.remove);
router.delete("/", ctrl.clearAll);

router.get("/preferences", ctrl.getPreferences);
router.put("/preferences", ctrl.updatePreferences);

export default router;
