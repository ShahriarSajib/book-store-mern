/**
 * routes/chatbotRoutes.js — /api/chat/*
 *   POST /                 send message, receive reply (may stream)
 *   GET  /history          recent conversations
 *   DELETE /history         clear conversations
 *   POST /confirm          confirm sensitive tool call (e.g. cancel order)
 */
// TODO
const router = require("express").Router();
module.exports = router;