/**
 * controllers/chatbotController.js — /api/chat, /api/chat/history.
 * Validates user + delegates to chatbotService. Never calls LLM directly.
 */
import catchAsync from "../utils/catchAsync.js";
import * as chatbotService from "../services/chatbotService.js";

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

export { send, confirm, getHistory, clearHistory };
