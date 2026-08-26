/**
 * services/wishlistService.js — per-user wishlist via the Wishlist collection.
 */
import AppError from "../utils/AppError.js";
import { Wishlist, Book, Cart } from "../models/index.js";

const POPULATE = {
  path: "items.book",
  select: "title coverImage price authors stock averageRating isActive",
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

const CART_POPULATE = {
  path: "items.book",
  select: "title coverImage price authors stock isActive",
};

async function moveToCart(userId, bookId) {
  const book = await Book.findById(bookId);
  if (!book) throw new AppError("Book not found", 404, "NOT_FOUND");
  if (!book.isActive) throw new AppError("This book is no longer available", 400, "BOOK_INACTIVE");
  if (book.stock <= 0) throw new AppError(`"${book.title}" is out of stock`, 409, "OUT_OF_STOCK");

  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) throw new AppError("Wishlist not found", 404, "NOT_FOUND");

  const inWishlist = wishlist.items.some((item) => String(item.book) === String(bookId));
  if (!inWishlist) throw new AppError("Book is not in your wishlist", 404, "NOT_IN_WISHLIST");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const existingCartItem = cart.items.find((item) => String(item.book) === String(bookId));
  const currentQty = existingCartItem ? existingCartItem.quantity : 0;
  if (currentQty + 1 > book.stock) {
    throw new AppError(`Only ${book.stock} in stock for "${book.title}"`, 409, "INSUFFICIENT_STOCK");
  }

  if (existingCartItem) {
    existingCartItem.quantity += 1;
    existingCartItem.price = book.price;
  } else {
    cart.items.push({ book: bookId, quantity: 1, price: book.price });
  }
  await cart.save();

  wishlist.items = wishlist.items.filter((item) => String(item.book) !== String(bookId));
  await wishlist.save();

  return {
    cart: await cart.populate(CART_POPULATE),
    wishlist: await wishlist.populate(POPULATE),
  };
}

export { getWishlist, add, remove, moveToCart };
