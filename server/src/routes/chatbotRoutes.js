/**
 * routes/chatbotRoutes.js — /api/chat/*
 *   POST /                 send message, receive reply (may stream)
 *   GET  /history          recent conversations
 *   DELETE /history        clear conversations
 *   POST /confirm          confirm sensitive tool call (e.g. cancel order)
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/chatbotController");

router.use(protect);

router.post("/confirm", ctrl.confirm);
router.get("/history", ctrl.getHistory);
router.delete("/history", ctrl.clearHistory);
router.post("/", ctrl.send);

module.exports = router;
