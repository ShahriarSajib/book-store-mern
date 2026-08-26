/**
 * services/notificationService.js — create, list, mark read, preferences.
 */
import { Notification, User } from "../models/index.js";
import { getPagination, buildPageMeta } from "../utils/paginate.js";
import AppError from "../utils/AppError.js";

async function create(userId, { type, title, message, link, data }) {
  const notification = await Notification.create({
    user: userId,
    type: type || "system",
    title,
    message,
    link: link || null,
    data: data || {},
  });
  return notification;
}

async function list(userId, query = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = { user: userId };
  if (query.unreadOnly === "true") filter.read = false;
  if (query.type) filter.type = query.type;

  const [total, unreadCount, notifications] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, read: false }),
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: buildPageMeta(total, page, limit),
  };
}

async function markAsRead(userId, notificationId) {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) throw new AppError("Notification not found", 404, "NOT_FOUND");
  notification.read = true;
  await notification.save();
  return notification;
}

async function markAllAsRead(userId) {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
  return { success: true };
}

async function remove(userId, notificationId) {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
  if (!notification) throw new AppError("Notification not found", 404, "NOT_FOUND");
  return { success: true };
}

async function clearAll(userId) {
  await Notification.deleteMany({ user: userId });
  return { success: true };
}

async function getPreferences(userId) {
  const user = await User.findById(userId).select("notificationPreferences");
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  return user.notificationPreferences || {
    email: { orderUpdates: true, promotions: true, newsletter: true },
    push: { orderUpdates: true, promotions: false, newsletter: false },
  };
}

async function updatePreferences(userId, preferences) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  user.notificationPreferences = preferences;
  await user.save();
  return user.notificationPreferences;
}

export {
  create,
  list,
  markAsRead,
  markAllAsRead,
  remove,
  clearAll,
  getPreferences,
  updatePreferences,
};
