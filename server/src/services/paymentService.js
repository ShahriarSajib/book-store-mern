/**
 * services/paymentService.js — Payment status management and Stripe refund.
 */
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { Order } from "../models/index.js";
import stripeService from "./stripeService.js";

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
    if (meta.stripePaymentIntentId) order.stripePaymentIntentId = meta.stripePaymentIntentId;
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
    "orderNumber paymentMethod paymentStatus paidAt refundedAt stripePaymentIntentId refundReason total"
  );
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  return order;
}

/**
 * Process a refund for a paid order via Stripe.
 */
async function refundOrder(orderId, reason = "requested_by_customer") {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  if (order.paymentStatus !== "paid") {
    throw new AppError("Order has not been paid", 400, "NOT_PAID");
  }
  if (order.paymentMethod !== "card") {
    throw new AppError("Refunds are only supported for card payments", 400, "REFUND_NOT_SUPPORTED");
  }
  if (!order.stripePaymentIntentId) {
    throw new AppError("No payment intent found for this order", 400, "NO_PAYMENT_INTENT");
  }

  const refund = await stripeService.refundPayment(order.stripePaymentIntentId, reason);

  order.paymentStatus = "refunded";
  order.refundedAt = new Date();
  order.refundReason = reason;
  await order.save();

  logger.info("Order refunded", { orderId: order._id, refundId: refund.id });
  return { order, refund };
}

export { updatePaymentStatus, getPaymentDetails, refundOrder };
