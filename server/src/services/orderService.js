/**
 * services/orderService.js — checkout, place order, status transitions,
 * cancellation eligibility, invoice generation.
 */
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const { Order, Cart, User, Book } = require("../models");
const couponService = require("./couponService");
const notificationService = require("./notificationService");
const socketService = require("./socketService");
const cartService = require("./cartService");
const logger = require("../utils/logger");
const { getPagination, buildPageMeta } = require("../utils/paginate");

const CANCELLABLE = ["pending", "confirmed", "processing"];
const ONLINE_PAYMENT_METHODS = ["card"];

const SHIPPING_RATE = 3.99;
const FREE_SHIPPING_THRESHOLD = 50;
const TAX_RATE = 0.05;

const CART_POPULATE = {
  path: "items.book",
  select: "title coverImage price authors stock isActive",
};

async function persistNotification(userId, { type, title, message, link, data }) {
  try {
    const { Notification } = require("../models");
    await Notification.create({ user: userId, type: type || "system", title, message, link: link || null, data: data || {} });
  } catch (_err) { /* persistence is best-effort */ }
}

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

  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const tax = Math.round(afterDiscount * TAX_RATE * 100) / 100;
  const total = Math.max(0, afterDiscount) + shipping + tax;

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

  const isOnlinePayment = ONLINE_PAYMENT_METHODS.includes(order.paymentMethod);

  if (!isOnlinePayment) {
    // Cash on delivery: decrement stock immediately and clear cart
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

    cartService.checkLowStockAfterOrder(items);
  }

  const user = await User.findById(userId).select("name email");
  order.user = user;
  notificationService.sendOrderConfirmation(order);

  try {
    socketService.emitToUser(userId, "order:created", {
      order: { _id: order._id, orderNumber: order.orderNumber, total: order.total, status: order.status },
      message: `Order #${order.orderNumber} placed successfully`,
    });
    socketService.emitToAdmins("order:created", {
      order: { _id: order._id, orderNumber: order.orderNumber, total: order.total, status: order.status, user: { name: user.name, email: user.email } },
      message: `New order #${order.orderNumber} from ${user.name}`,
    });
    persistNotification(userId, { type: "order", title: "Order placed", message: `Order #${order.orderNumber} placed successfully`, link: `/orders/${order._id}`, data: { orderId: order._id } });
  } catch (_err) { /* socket emit is best-effort */ }

  return { order, isOnlinePayment };
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

async function reorder(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");

  const bookIds = order.items.map((item) => item.book);
  const books = await Book.find({ _id: { $in: bookIds }, isActive: true });

  const bookMap = new Map(books.map((b) => [String(b._id), b]));

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  let addedCount = 0;
  let skippedCount = 0;

  for (const item of order.items) {
    const book = bookMap.get(String(item.book));
    if (!book) {
      skippedCount++;
      continue;
    }

    const existing = cart.items.find((ci) => String(ci.book) === String(item.book));
    const currentQty = existing ? existing.quantity : 0;
    const requestedQty = Math.min(item.quantity, book.stock);

    if (requestedQty <= 0) {
      skippedCount++;
      continue;
    }

    if (existing) {
      existing.quantity = Math.min(currentQty + requestedQty, book.stock);
      existing.price = book.price;
    } else {
      cart.items.push({ book: book._id, quantity: requestedQty, price: book.price });
    }
    addedCount++;
  }

  await cart.save();

  return {
    cart: await cart.populate(CART_POPULATE),
    addedCount,
    skippedCount,
    message: skippedCount > 0
      ? `${addedCount} item(s) added to cart, ${skippedCount} unavailable`
      : `${addedCount} item(s) added to cart`,
  };
}

async function getTracking(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");

  const statusSteps = [
    { key: "pending", label: "Order placed", completed: true, date: order.createdAt },
    { key: "confirmed", label: "Order confirmed", completed: false, date: null },
    { key: "processing", label: "Processing", completed: false, date: null },
    { key: "shipped", label: "Shipped", completed: false, date: null },
    { key: "delivered", label: "Delivered", completed: false, date: null },
  ];

  const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentIdx = statusOrder.indexOf(order.status);

  if (order.status === "cancelled") {
    statusSteps.forEach((s) => {
      s.completed = false;
      s.date = null;
    });
    statusSteps[0] = { key: "pending", label: "Order placed", completed: true, date: order.createdAt };
  } else {
    for (let i = 0; i < statusSteps.length; i++) {
      if (i <= currentIdx) {
        statusSteps[i].completed = true;
        if (i === 0) statusSteps[i].date = order.createdAt;
        else if (i === 1) statusSteps[i].date = order.status === "confirmed" ? order.updatedAt : order.paidAt || null;
        else if (i === 2) statusSteps[i].date = order.status === "processing" ? order.updatedAt : null;
        else if (i === 3) statusSteps[i].date = order.status === "shipped" ? order.updatedAt : null;
        else if (i === 4) statusSteps[i].date = order.status === "delivered" ? order.updatedAt : null;
      }
    }
    if (currentIdx >= 3) {
      statusSteps[3].date = statusSteps[3].date || order.updatedAt;
    }
    if (currentIdx >= 4) {
      statusSteps[4].date = statusSteps[4].date || order.updatedAt;
    }
  }

  const estimatedDelivery =
    order.status === "shipped"
      ? new Date(new Date(order.updatedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
      : order.status === "delivered"
        ? order.updatedAt
        : null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    trackingNumber: order.trackingNumber || null,
    shippingAddress: order.shippingAddress,
    statusSteps,
    estimatedDelivery,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
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

  try {
    socketService.emitToUser(userId, "order:cancelled", {
      order: { _id: order._id, orderNumber: order.orderNumber, status: "cancelled" },
      message: `Order #${order.orderNumber} has been cancelled`,
    });
    socketService.emitToAdmins("order:cancelled", {
      order: { _id: order._id, orderNumber: order.orderNumber, status: "cancelled" },
      message: `Order #${order.orderNumber} was cancelled`,
    });
    persistNotification(userId, { type: "order_status", title: "Order cancelled", message: `Order #${order.orderNumber} has been cancelled`, link: `/orders/${order._id}`, data: { orderId: order._id } });
  } catch (_err) { /* socket emit is best-effort */ }

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
  const oldStatus = order.status;
  const allowed = ["status", "paymentStatus", "trackingNumber"];
  allowed.forEach((field) => {
    if (patch[field] !== undefined) order[field] = patch[field];
  });
  await order.save();
  if (patch.status && patch.status !== oldStatus) {
    const user = await User.findById(order.user).select("name email");
    order.user = user;
    notificationService.sendOrderStatusUpdate(order, oldStatus);

    try {
      const statusLabels = {
        confirmed: "has been confirmed",
        processing: "is being processed",
        shipped: "has been shipped",
        delivered: "has been delivered",
        cancelled: "has been cancelled",
      };
      const statusMsg = `Order #${order.orderNumber} ${statusLabels[order.status] || `status changed to ${order.status}`}`;
      socketService.emitToUser(String(order.user._id || order.user), "order:statusChanged", {
        order: { _id: order._id, orderNumber: order.orderNumber, status: order.status, trackingNumber: order.trackingNumber },
        oldStatus,
        message: statusMsg,
      });
      socketService.emitToAdmins("order:statusChanged", {
        order: { _id: order._id, orderNumber: order.orderNumber, status: order.status },
        oldStatus,
        message: `Order #${order.orderNumber} status: ${oldStatus} → ${order.status}`,
      });
      persistNotification(String(order.user._id || order.user), { type: "order_status", title: "Order status updated", message: statusMsg, link: `/orders/${order._id}`, data: { orderId: order._id, oldStatus, newStatus: order.status } });
    } catch (_err) { /* socket emit is best-effort */ }
  }
  return order;
}

function escapeCsvField(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeCsvRow(row) {
  return row.map(escapeCsvField).join(",");
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
  return rows.map((row) => (row.length === 0 ? "" : escapeCsvRow(row))).join("\n");
}

/**
 * Confirm payment for an order (called by Stripe webhook on checkout.session.completed).
 * Decrements stock, clears cart, updates payment status.
 */
async function confirmPayment(orderId, stripeSessionId, stripePaymentIntentId) {
  const order = await Order.findById(orderId);
  if (!order) {
    logger.warn("confirmPayment: order not found", { orderId });
    return null;
  }
  if (order.paymentStatus === "paid") return order; // idempotent

  order.paymentStatus = "paid";
  order.paidAt = new Date();
  if (stripePaymentIntentId) order.stripePaymentIntentId = stripePaymentIntentId;
  if (stripeSessionId) order.stripeSessionId = stripeSessionId;
  await order.save();

  // Decrement stock and increment purchase count (deferred from order creation for online payments)
  await Promise.all(
    order.items.map((item) =>
      Book.updateOne(
        { _id: item.book, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, purchaseCount: item.quantity } }
      )
    )
  );

  cartService.checkLowStockAfterOrder(order.items);

  // Clear the user's cart
  await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [], coupon: undefined } });

  logger.info("Order payment confirmed", { orderId: order._id, orderNumber: order.orderNumber });

  try {
    const userId = String(order.user);
    socketService.emitToUser(userId, "payment:confirmed", {
      order: { _id: order._id, orderNumber: order.orderNumber, total: order.total, paymentStatus: "paid" },
      message: `Payment confirmed for order #${order.orderNumber}`,
    });
    socketService.emitToAdmins("payment:confirmed", {
      order: { _id: order._id, orderNumber: order.orderNumber, total: order.total, paymentStatus: "paid" },
      message: `Payment received for order #${order.orderNumber}`,
    });
    persistNotification(userId, { type: "payment", title: "Payment confirmed", message: `Payment confirmed for order #${order.orderNumber}`, link: `/orders/${order._id}`, data: { orderId: order._id } });
  } catch (_err) { /* socket emit is best-effort */ }

  return order;
}

/**
 * Mark payment as failed (called by Stripe webhook on payment_intent.payment_failed).
 */
async function failPayment(orderId, reason) {
  const order = await Order.findById(orderId);
  if (!order) return null;
  if (order.paymentStatus === "paid") return order; // already paid, don't downgrade

  order.paymentStatus = "failed";
  await order.save();

  logger.warn("Order payment failed", { orderId: order._id, reason });

  try {
    socketService.emitToUser(String(order.user), "payment:failed", {
      order: { _id: order._id, orderNumber: order.orderNumber, paymentStatus: "failed" },
      reason,
      message: `Payment failed for order #${order.orderNumber}`,
    });
  } catch (_err) { /* socket emit is best-effort */ }

  return order;
}

/**
 * Handle expired Stripe checkout session.
 * Cancels the order and releases any held resources.
 */
async function expireSession(orderId) {
  const order = await Order.findById(orderId);
  if (!order) return null;
  if (order.paymentStatus === "paid" || order.status === "cancelled") return order;

  order.paymentStatus = "failed";
  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = "Payment session expired";
  await order.save();

  logger.info("Order cancelled due to expired session", { orderId: order._id });

  try {
    socketService.emitToUser(String(order.user), "payment:expired", {
      order: { _id: order._id, orderNumber: order.orderNumber, status: "cancelled", paymentStatus: "failed" },
      message: `Payment session for order #${order.orderNumber} has expired`,
    });
  } catch (_err) { /* socket emit is best-effort */ }

  return order;
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  getTracking,
  reorder,
  cancelOrder,
  listAll,
  updateStatus,
  confirmPayment,
  failPayment,
  expireSession,
  invoiceRows,
};
