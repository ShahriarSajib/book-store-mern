/**
 * jobs/lowStockNotifier.js
 * Responsibility: periodically scan the catalog for books at/below the
 * low-stock threshold and alert staff (socket rooms + persisted notifications).
 */
const Book = require("../models/Book");
const User = require("../models/User");
const Notification = require("../models/Notification");
const socketService = require("../services/socketService");
const env = require("../config/env");
const logger = require("../utils/logger");

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

  // Persist a notification per admin so the alert survives reconnects.
  try {
    const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
    if (admins.length > 0) {
      await Notification.insertMany(
        admins.flatMap((admin) =>
          lowStockBooks.map((book) => ({
            user: admin._id,
            type: "stock",
            title: "Low stock alert",
            message: `"${book.title}" has only ${book.stock} unit(s) left`,
            link: `/admin/books?search=${encodeURIComponent(book.title)}`,
            data: { bookId: String(book._id), stock: book.stock },
          }))
        )
      );
    }
  } catch (err) {
    logger.warn("[job:lowStockNotifier] failed to persist notifications", { error: err.message });
  }

  logger.info(`[job:lowStockNotifier] alerted on ${lowStockBooks.length} low-stock book(s)`);
  return { alerted: lowStockBooks.length, books: lowStockBooks };
}

module.exports = { run };
