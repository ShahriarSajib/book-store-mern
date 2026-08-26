/**
 * routes/chatbotRoutes.js — /api/chat/*
 *   POST /                 send message, receive reply (may stream)
 *   GET  /history          recent conversations
 *   DELETE /history        clear conversations
 *   POST /confirm          confirm sensitive tool call (e.g. cancel order)
 */
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import * as ctrl from "../controllers/chatbotController.js";

const router = Router();

router.use(protect);

router.post("/confirm", ctrl.confirm);
router.get("/history", ctrl.getHistory);
router.delete("/history", ctrl.clearHistory);
router.post("/", ctrl.send);

export default router;
