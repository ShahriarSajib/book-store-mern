/**
 * services/cartService.js — add/remove/update quantity, totals, coupon validation.
 */
const AppError = require("../utils/AppError");
const { Cart, Book } = require("../models");
const couponService = require("./couponService");

const BOOK_POPULATE = {
  path: "items.book",
  select: "title coverImage price authors stock isActive",
};

async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart.populate(BOOK_POPULATE);
}

async function recalcCoupon(cart) {
  if (!cart.coupon || !cart.coupon.code) return cart;
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  try {
    const { discount } = await couponService.apply(cart.coupon.code, subtotal);
    cart.coupon.discount = discount;
  } catch (_err) {
    cart.coupon = undefined;
  }
  await cart.save();
  return cart;
}

async function addItem(userId, bookId, quantity = 1) {
  const qty = Math.max(1, Number(quantity) || 1);
  const book = await Book.findById(bookId);
  if (!book) throw new AppError("Book not found", 404, "NOT_FOUND");
  if (!book.isActive) throw new AppError("This book is no longer available", 400, "BOOK_INACTIVE");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const existing = cart.items.find((item) => String(item.book) === String(bookId));
  const requestedQty = (existing ? existing.quantity : 0) + qty;
  if (requestedQty > book.stock) {
    throw new AppError(`Only ${book.stock} in stock`, 409, "INSUFFICIENT_STOCK");
  }

  if (existing) {
    existing.quantity = requestedQty;
    existing.price = book.price;
  } else {
    cart.items.push({ book: bookId, quantity: qty, price: book.price });
  }
  await cart.save();
  await recalcCoupon(cart);
  return cart.populate(BOOK_POPULATE);
}

async function updateQuantity(userId, bookId, quantity) {
  const qty = Math.max(1, Number(quantity) || 1);
  const book = await Book.findById(bookId);
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart is empty", 404, "CART_EMPTY");

  const existing = cart.items.find((item) => String(item.book) === String(bookId));
  if (!existing) throw new AppError("Item not in cart", 404, "ITEM_NOT_FOUND");
  if (book && qty > book.stock) {
    throw new AppError(`Only ${book.stock} in stock`, 409, "INSUFFICIENT_STOCK");
  }
  existing.quantity = qty;
  if (book) existing.price = book.price;
  await cart.save();
  await recalcCoupon(cart);
  return cart.populate(BOOK_POPULATE);
}

async function removeItem(userId, bookId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError("Cart is empty", 404, "CART_EMPTY");
  cart.items = cart.items.filter((item) => String(item.book) !== String(bookId));
  await cart.save();
  await recalcCoupon(cart);
  return cart.populate(BOOK_POPULATE);
}

async function clearCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return { success: true };
  cart.items = [];
  cart.coupon = undefined;
  await cart.save();
  return { success: true };
}

async function applyCoupon(userId, code) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new AppError("Your cart is empty", 400, "CART_EMPTY");
  }
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const result = await couponService.apply(code, subtotal);
  cart.coupon = { code: result.coupon.code, discount: result.discount };
  await cart.save();
  return cart.populate(BOOK_POPULATE);
}

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  applyCoupon,
};
