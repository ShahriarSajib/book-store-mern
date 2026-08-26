/**
 * routes/bookRoutes.js — /api/books/*
 *   Public: GET /, GET /:id
 *   Admin:  POST /, PUT /:id, DELETE /:id
 */
import { Router } from "express";
import validate from "../middleware/validate.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { bookValidators } from "../validators/index.js";
import * as ctrl from "../controllers/bookController.js";

const router = Router();

router.get("/", validate(bookValidators.listBooksValidators), ctrl.list);
router.get("/:id", optionalAuth, ctrl.getById);

router.post("/", protect, requireAdmin, validate(bookValidators.createBookValidators), ctrl.create);
router.put("/:id", protect, requireAdmin, validate(bookValidators.updateBookValidators), ctrl.update);
router.delete("/:id", protect, requireAdmin, ctrl.remove);

export default router;
