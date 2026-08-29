/**
 * services/inventoryService.js — stock listing and stock updates.
 */
import AppError from "../utils/AppError.js";
import { Book } from "../models/index.js";
import { getPagination, buildPageMeta } from "../utils/paginate.js";
import socketService from "./socketService.js";

const DEFAULT_LOW_STOCK = 10;
const MAX_LIMIT = 100;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function list({ page = 1, limit = 50, lowOnly, search = "" } = {}) {
  const { skip } = getPagination({ page, limit });
  const clamped = Math.min(Math.max(Number(limit) || 50, 1), MAX_LIMIT);

  const filter = {};

  // Server-side low-stock filter instead of pulling every book and filtering
  // in the browser.
  if (lowOnly === "true" || lowOnly === true) {
    filter.stock = { $lte: DEFAULT_LOW_STOCK };
  }

  const term = (search || "").trim();
  if (term) {
    const regex = new RegExp(escapeRegex(term), "i");
    filter.$or = [
      { title: regex },
      { subtitle: regex },
      { authors: regex },
      { publisher: regex },
      { isbn10: regex },
      { isbn13: regex },
    ];
  }

  const [books, total] = await Promise.all([
    Book.find(filter)
      .select("title price stock coverImage averageRating isActive")
      .sort({ stock: 1 })
      .skip(skip)
      .limit(clamped)
      .lean(),
    Book.countDocuments(filter),
  ]);

  return {
    items: books,
    pagination: buildPageMeta(total, Number(page) || 1, clamped),
  };
}

async function updateStock(bookId, stock) {
  const qty = Number(stock);
  if (!Number.isFinite(qty) || qty < 0) {
    throw new AppError("Stock must be a non-negative number", 400, "VALIDATION_ERROR");
  }
  const book = await Book.findById(bookId);
  if (!book) throw new AppError("Book not found", 404, "NOT_FOUND");
  book.stock = qty;
  await book.save();

  try {
    socketService.emitToInventory("stock:updated", {
      book: { _id: book._id, title: book.title, stock: book.stock, price: book.price },
      message: `Stock updated for "${book.title}": ${book.stock} units`,
    });
    if (socketService.isLowStock(book.stock)) {
      socketService.emitToAdmins("stock:low", {
        book: { _id: book._id, title: book.title, stock: book.stock },
        message: `Low stock alert: "${book.title}" has only ${book.stock} units left`,
      });
    }
  } catch (_err) { /* socket emit is best-effort */ }

  return { book };
}

export { list, updateStock };
