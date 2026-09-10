/**
 * jobs/lowStockNotifier.js
 * Responsibility: periodically scan the catalog for books at/below the
 * low-stock threshold and alert staff (socket rooms + persisted notifications).
 */
import Book from "../models/Book.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import socketService from "../services/socketService.js";
import env from "../config/env.js";
import logger from "../utils/logger.js";

async function run() {
  const threshold = Number(env.LOW_STOCK_THRESHOLD) || 5;

  const lowStockBooks = await Book.find({
    isActive: true,
    stock: { $gte: 0, $lte: threshold },
  })
    .select("title stock")
    .lean();

  if (lowStockBooks.length === 0) {
    logger.debug("[job:lowStockNotifier] no low-stock books");
    return { alerted: 0, books: [] };
  }

  for (const book of lowStockBooks) {
    socketService.emitToAdmins("stock:low", {
      book: { _id: book._id, title: book.title, stock: book.stock },
      message: `Low stock alert: "${book.title}" has only ${book.stock} units left`,
    });
    socketService.emitToInventory("stock:low", {
      book: { _id: book._id, title: book.title, stock: book.stock },
      message: `Low stock alert: "${book.title}" has only ${book.stock} units left`,
    });
  }

  // Persist a notification per admin — skip if an unread stock alert
  // for the same book already exists (avoids duplicate accumulation).
  try {
    const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
    if (admins.length > 0) {
      const existingAlerts = await Notification.find({
        type: "stock",
        read: false,
      })
        .select("user data.bookId")
        .lean();

      const existingSet = new Set(
        existingAlerts.map((a) => `${a.user}-${a.data?.bookId}`)
      );

      const newNotifications = admins.flatMap((admin) =>
        lowStockBooks
          .filter((book) => !existingSet.has(`${admin._id}-${String(book._id)}`))
          .map((book) => ({
            user: admin._id,
            type: "stock",
            title: "Low stock alert",
            message: `"${book.title}" has only ${book.stock} unit(s) left`,
            link: `/admin/books?search=${encodeURIComponent(book.title)}`,
            data: { bookId: String(book._id), stock: book.stock },
          }))
      );

      if (newNotifications.length > 0) {
        await Notification.insertMany(newNotifications);
      }
    }
  } catch (err) {
    logger.warn("[job:lowStockNotifier] failed to persist notifications", { error: err.message });
  }

  logger.info(`[job:lowStockNotifier] alerted on ${lowStockBooks.length} low-stock book(s)`);
  return { alerted: lowStockBooks.length, books: lowStockBooks };
}

export { run };
