/**
 * controllers/cartController.js — cart endpoints.
 */
import catchAsync from "../utils/catchAsync.js";
import * as cartService from "../services/cartService.js";

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

const removeCoupon = catchAsync(async (req, res) => {
  const cart = await cartService.removeCoupon(req.user.id);
  res.json({ cart });
});

export { getCart, addItem, updateItem, removeItem, clearCart, applyCoupon, removeCoupon };
