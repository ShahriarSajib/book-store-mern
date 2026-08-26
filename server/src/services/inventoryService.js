/**
 * services/inventoryService.js — stock listing and stock updates.
 */
import AppError from "../utils/AppError.js";
import { Book } from "../models/index.js";
import socketService from "./socketService.js";

async function list() {
  const books = await Book.find()
    .select("title price stock coverImage averageRating isActive")
    .sort({ stock: 1 });
  return { items: books };
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
