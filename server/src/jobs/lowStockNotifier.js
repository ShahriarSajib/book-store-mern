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

  // Persist a notification per admin and keep at most ONE stock alert per
  // book+admin (upsert). The old logic only deduplicated against *unread*
  // notifications, so the moment an admin marked an alert as read the next
  // run re-inserted it — notifications (and storage) grew forever. Upserting
  // on { user, type, "data.bookId" } makes this idempotent regardless of
  // read state; the message/stock simply refresh on each run.
  try {
    const admins = await User.find({ role: "admin", isActive: true }).select("_id").lean();
    if (admins.length > 0) {
      const ops = admins.flatMap((admin) =>
        lowStockBooks.map((book) => ({
          updateOne: {
            filter: {
              user: admin._id,
              type: "stock",
              "data.bookId": String(book._id),
            },
            update: {
              $set: {
                title: "Low stock alert",
                message: `"${book.title}" has only ${book.stock} unit(s) left`,
                link: `/admin/books?search=${encodeURIComponent(book.title)}`,
                data: { bookId: String(book._id), stock: book.stock },
              },
            },
            upsert: true,
          },
        }))
      );

      if (ops.length > 0) {
        await Notification.bulkWrite(ops, { ordered: false });
      }
    }
  } catch (err) {
    logger.warn("[job:lowStockNotifier] failed to persist notifications", { error: err.message });
  }

  logger.info(`[job:lowStockNotifier] alerted on ${lowStockBooks.length} low-stock book(s)`);
  return { alerted: lowStockBooks.length, books: lowStockBooks };
}

export { run };
