/**
 * routes/recommendationAdminRoutes.js — /api/admin/recommendations/*
 */
import { Router } from "express";
import * as ctrl from "../controllers/recommendationAdminController.js";

const router = Router();

router.get("/summary", ctrl.getSummary);
router.get("/embeddings", ctrl.embeddingStatus);
router.get("/logs", ctrl.listLogs);
router.get("/most-recommended", ctrl.getMostRecommended);
router.get("/most-clicked", ctrl.getMostClicked);
router.post("/embeddings/regenerate", ctrl.regenerateEmbeddings);

export default router;
