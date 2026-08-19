/**
 * routes/recommendationAdminRoutes.js — /api/admin/recommendations/*
 */
const router = require("express").Router();
const ctrl = require("../controllers/recommendationAdminController");

router.get("/summary", ctrl.getSummary);
router.get("/embeddings", ctrl.embeddingStatus);
router.get("/logs", ctrl.listLogs);
router.get("/most-recommended", ctrl.getMostRecommended);
router.get("/most-clicked", ctrl.getMostClicked);
router.post("/embeddings/regenerate", ctrl.regenerateEmbeddings);

module.exports = router;
