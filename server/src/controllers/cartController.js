/**
 * controllers/cartController.js — cart endpoints.
 */
const catchAsync = require("../utils/catchAsync");
const cartService = require("../services/cartService");

const getCart = catchAsync(async (req, res) => {
  res.json({ cart: await cartService.getCart(req.user.id) });
});

const addItem = catchAsync(async (req, res) => {
  const { bookId, quantity } = req.body;
  const cart = await cartService.addItem(req.user.id, bookId, quantity);
  res.status(201).json({ cart });
});

const updateItem = catchAsync(async (req, res) => {
  const cart = await cartService.updateQuantity(req.user.id, req.params.bookId, req.body.quantity);
  res.json({ cart });
});

const removeItem = catchAsync(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.bookId);
  res.json({ cart });
});

const clearCart = catchAsync(async (req, res) => {
  res.json(await cartService.clearCart(req.user.id));
});

const applyCoupon = catchAsync(async (req, res) => {
  const cart = await cartService.applyCoupon(req.user.id, req.body.code);
  res.json({ cart });
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon };
