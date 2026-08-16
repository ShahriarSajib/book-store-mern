/**
 * services/wishlistService.js — per-user wishlist via the Wishlist collection.
 */
const AppError = require("../utils/AppError");
const { Wishlist, Book } = require("../models");

const POPULATE = {
  path: "items.book",
  select: "title coverImage price authors stock averageRating",
};

async function getWishlist(userId) {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  return wishlist.populate(POPULATE);
}

async function add(userId, bookId) {
  const book = await Book.findById(bookId);
  if (!book) throw new AppError("Book not found", 404, "NOT_FOUND");

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, items: [] });

  const existing = wishlist.items.some((item) => String(item.book) === String(bookId));
  if (!existing) wishlist.items.push({ book: bookId });

  await wishlist.save();
  return wishlist.populate(POPULATE);
}

async function remove(userId, bookId) {
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) throw new AppError("Wishlist is empty", 404, "NOT_FOUND");
  wishlist.items = wishlist.items.filter((item) => String(item.book) !== String(bookId));
  await wishlist.save();
  return wishlist.populate(POPULATE);
}

module.exports = { getWishlist, add, remove };
