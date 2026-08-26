/**
 * routes/faqRoutes.js — /api/faq
 *   Public: GET /search?q=
 *   Admin:  GET /, POST /, PUT /:id, DELETE /:id
 */
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as ctrl from "../controllers/faqController.js";

const router = Router();

router.get("/search", ctrl.search);

router.get("/", protect, requireAdmin, ctrl.list);
router.post("/", protect, requireAdmin, ctrl.create);
router.put("/:id", protect, requireAdmin, ctrl.update);
router.delete("/:id", protect, requireAdmin, ctrl.remove);

export default router;
