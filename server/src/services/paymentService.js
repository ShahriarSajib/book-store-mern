const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const { Order } = require("../models");

const VALID_TRANSITIONS = {
  pending: ["paid", "failed"],
  paid: ["refunded"],
  failed: ["pending"],
  refunded: [],
};

async function updatePaymentStatus(orderId, status, meta = {}) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");

  const allowed = VALID_TRANSITIONS[order.paymentStatus];
  if (!allowed || !allowed.includes(status)) {
    throw new AppError(
      `Cannot transition payment from ${order.paymentStatus} to ${status}`,
      400,
      "INVALID_PAYMENT_TRANSITION"
    );
  }

  order.paymentStatus = status;
  if (status === "paid") {
    order.paidAt = new Date();
    order.transactionId = meta.transactionId;
  }
  if (status === "refunded") {
    order.refundedAt = new Date();
    order.refundReason = meta.reason || "";
  }
  await order.save();
  logger.info("Payment status updated", { orderId, from: allowed[0], to: status });
  return order;
}

async function getPaymentDetails(orderId) {
  const order = await Order.findById(orderId).select(
    "orderNumber paymentMethod paymentStatus paidAt refundedAt transactionId refundReason total"
  );
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  return order;
}

module.exports = { updatePaymentStatus, getPaymentDetails };
