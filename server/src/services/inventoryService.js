/**
 * services/inventoryService.js — stock listing and stock updates.
 */
const AppError = require("../utils/AppError");
const { Book } = require("../models");

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
  return { book };
}

module.exports = { list, updateStock };
