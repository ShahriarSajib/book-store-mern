/**
 * services/orderService.js — checkout, place order, status transitions,
 * cancellation eligibility, invoice generation.
 */
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const { Order, Cart, User, Book } = require("../models");
const couponService = require("./couponService");
const { getPagination, buildPageMeta } = require("../utils/paginate");

const CANCELLABLE = ["pending", "processing"];

function generateOrderNumber() {
  const stamp = new Date();
  const date = [
    stamp.getFullYear(),
    String(stamp.getMonth() + 1).padStart(2, "0"),
    String(stamp.getDate()).padStart(2, "0"),
  ].join("");
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${date}-${rand}`;
}

async function resolveShippingAddress(userId, payload) {
  if (payload.shippingAddress && payload.shippingAddress.street && payload.shippingAddress.recipient) {
    return payload.shippingAddress;
  }
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  if (payload.shippingAddressId) {
    const address = user.addresses.id(payload.shippingAddressId);
    if (!address) throw new AppError("Shipping address not found", 404, "ADDRESS_NOT_FOUND");
    const doc = address.toObject();
    delete doc._id;
    return doc;
  }
  const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
  if (!defaultAddr) throw new AppError("Please add a shipping address first", 400, "NO_SHIPPING_ADDRESS");
  const doc = defaultAddr.toObject();
  delete doc._id;
  return doc;
}

async function createOrder(userId, payload = {}) {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.book",
    select: "title coverImage price stock isActive purchaseCount",
  });
  if (!cart || cart.items.length === 0) {
    throw new AppError("Your cart is empty", 400, "CART_EMPTY");
  }

  const items = cart.items.map((item) => {
    const book = item.book;
    if (!book || !book.isActive) {
      throw new AppError("A book in your cart is no longer available", 409, "BOOK_INACTIVE");
    }
    if (item.quantity > book.stock) {
      throw new AppError(`Only ${book.stock} in stock for "${book.title}"`, 409, "INSUFFICIENT_STOCK");
    }
    return {
      book: book._id,
      title: book.title,
      coverImage: book.coverImage,
      quantity: item.quantity,
      price: book.price,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let coupon;
  let discount = 0;
  if (cart.coupon && cart.coupon.code) {
    const result = await couponService.apply(cart.coupon.code, subtotal);
    coupon = { code: result.coupon.code, discount: result.discount };
    discount = result.discount;
    await couponService.trackUsage(cart.coupon.code);
  }

  const shipping = 0;
  const tax = 0;
  const total = Math.max(0, subtotal - discount) + shipping + tax;

  const shippingAddress = await resolveShippingAddress(userId, payload);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: userId,
    items,
    coupon,
    subtotal,
    shipping,
    tax,
    total,
    paymentMethod: payload.paymentMethod || "cash_on_delivery",
    paymentStatus: "pending",
    shippingAddress,
    notes: payload.notes,
    status: "pending",
  });

  await Promise.all(
    items.map((item) =>
      Book.updateOne(
        { _id: item.book, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, purchaseCount: item.quantity } }
      )
    )
  );

  cart.items = [];
  cart.coupon = undefined;
  await cart.save();

  return order;
}

async function listOrders(userId, query = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = { user: userId };
  if (query.status) filter.status = query.status;
  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);
  return { orders, pagination: buildPageMeta(total, page, limit) };
}

async function getOrder(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  return order;
}

async function cancelOrder(userId, orderId, reason) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  if (!CANCELLABLE.includes(order.status)) {
    throw new AppError("This order can no longer be cancelled", 400, "ORDER_NOT_CANCELLABLE");
  }
  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = reason || "";
  await order.save();

  await Promise.all(
    order.items.map((item) =>
      Book.updateOne({ _id: item.book }, { $inc: { stock: item.quantity } })
    )
  );
  return order;
}

async function listAll(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.search) filter.orderNumber = new RegExp(query.search.trim(), "i");
  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);
  return { orders, pagination: buildPageMeta(total, page, limit) };
}

async function updateStatus(orderId, patch) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  const allowed = ["status", "paymentStatus", "trackingNumber"];
  allowed.forEach((field) => {
    if (patch[field] !== undefined) order[field] = patch[field];
  });
  await order.save();
  return order;
}

function invoiceRows(order) {
  const rows = [
    ["AI Bookstore — Invoice"],
    ["Order number", order.orderNumber],
    ["Placed at", new Date(order.createdAt).toISOString()],
    ["Status", order.status],
    ["Payment", order.paymentStatus],
    ["Customer", order.user?.name || ""],
    ["Email", order.user?.email || ""],
    [],
    ["Item", "Qty", "Unit price", "Line total"],
    ...order.items.map((item) => [
      item.title,
      item.quantity,
      item.price.toFixed(2),
      (item.quantity * item.price).toFixed(2),
    ]),
    [],
    ["Subtotal", order.subtotal.toFixed(2)],
    ["Discount", `-${(order.coupon?.discount || 0).toFixed(2)}`],
    ["Shipping", order.shipping.toFixed(2)],
    ["Tax", order.tax.toFixed(2)],
    ["Total", order.total.toFixed(2)],
  ];
  return rows.map((row) => row.join(",")).join("\n");
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  cancelOrder,
  listAll,
  updateStatus,
  invoiceRows,
};
