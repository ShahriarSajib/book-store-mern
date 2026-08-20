/**
 * controllers/notificationController.js — notification CRUD + preferences.
 */
const catchAsync = require("../utils/catchAsync");
const pick = require("../utils/pick");
const notificationService = require("../services/notificationPersistService");

const list = catchAsync(async (req, res) => {
  const query = pick(req.query, ["page", "limit", "unreadOnly", "type"]);
  res.json(await notificationService.list(req.user.id, query));
});

const markAsRead = catchAsync(async (req, res) => {
  res.json({ notification: await notificationService.markAsRead(req.user.id, req.params.id) });
});

const markAllAsRead = catchAsync(async (req, res) => {
  res.json(await notificationService.markAllAsRead(req.user.id));
});

const remove = catchAsync(async (req, res) => {
  res.json(await notificationService.remove(req.user.id, req.params.id));
});

const clearAll = catchAsync(async (req, res) => {
  res.json(await notificationService.clearAll(req.user.id));
});

const getPreferences = catchAsync(async (req, res) => {
  res.json(await notificationService.getPreferences(req.user.id));
});

const updatePreferences = catchAsync(async (req, res) => {
  res.json(await notificationService.updatePreferences(req.user.id, req.body));
});

module.exports = {
  list,
  markAsRead,
  markAllAsRead,
  remove,
  clearAll,
  getPreferences,
  updatePreferences,
};
