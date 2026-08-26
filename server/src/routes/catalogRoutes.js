/**
 * routes/catalogRoutes.js — /api/categories, /api/authors, /api/publishers
 *   Public: GET /, GET /:id
 *   Admin:  POST /, PUT /:id, DELETE /:id
 */
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as ctrl from "../controllers/catalogController.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);

router.post("/", protect, requireAdmin, ctrl.create);
router.put("/:id", protect, requireAdmin, ctrl.update);
router.delete("/:id", protect, requireAdmin, ctrl.remove);

export default router;
