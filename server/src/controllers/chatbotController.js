/**
 * controllers/chatbotController.js — /api/chat, /api/chat/history.
 * Validates user + delegates to chatbotService. Never calls LLM directly.
 */
const catchAsync = require("../utils/catchAsync");
const chatbotService = require("../services/chatbotService");

const send = catchAsync(async (req, res) => {
  res.json(await chatbotService.sendMessage(req.user.id, req.body));
});

const confirm = catchAsync(async (req, res) => {
  res.json(await chatbotService.confirmAction(req.user.id, req.body.confirmationToken));
});

const getHistory = catchAsync(async (req, res) => {
  res.json(await chatbotService.history(req.user.id));
});

const clearHistory = catchAsync(async (req, res) => {
  res.json(await chatbotService.clearHistory(req.user.id));
});

module.exports = { send, confirm, getHistory, clearHistory };
