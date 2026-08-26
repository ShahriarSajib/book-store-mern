/**
 * routes/searchRoutes.js — /api/search/*
 *   GET /                keyword + filters + sort + pagination
 *   GET /autocomplete
 */
import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import * as ctrl from "../controllers/searchController.js";

const router = Router();

router.get("/autocomplete", ctrl.autocomplete);
router.get("/", optionalAuth, ctrl.search);

export default router;
