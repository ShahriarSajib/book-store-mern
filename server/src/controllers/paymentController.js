/**
 * controllers/paymentController.js — Stripe checkout, webhook, config.
 */
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import stripeService from "../services/stripeService.js";
import * as orderService from "../services/orderService.js";
import logger from "../utils/logger.js";
import { Order } from "../models/index.js";

/**
 * POST /api/payments/create-checkout-session
 * Creates a Stripe Checkout Session for an existing order.
 * Body: { orderId, successUrl?, cancelUrl? }
 */
const createCheckoutSession = catchAsync(async (req, res) => {
  const { orderId, successUrl, cancelUrl } = req.body;
  if (!orderId) throw new AppError("orderId is required", 400, "VALIDATION_ERROR");

  // Fetch order and populate user for email
  const order = await Order.findById(orderId).populate("user", "name email");
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");

  // Ensure the order belongs to the current user
  const orderUserId = String(order.user?._id || order.user);
  if (orderUserId !== req.user.id) {
    throw new AppError("Not authorized", 403, "FORBIDDEN");
  }

  if (order.paymentMethod !== "card") {
    throw new AppError("This order is not set up for card payment", 400, "INVALID_PAYMENT_METHOD");
  }

  if (order.paymentStatus === "paid") {
    throw new AppError("Order is already paid", 400, "ALREADY_PAID");
  }

  const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const finalSuccessUrl =
    successUrl || `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`;
  const finalCancelUrl =
    cancelUrl || `${baseUrl}/payment/cancel?order_id=${orderId}`;

  const { sessionId, sessionUrl } = await stripeService.createCheckoutSession(
    order,
    finalSuccessUrl,
    finalCancelUrl
  );

  // Store the session ID on the order
  order.stripeSessionId = sessionId;
  await order.save();

  res.json({ sessionId, url: sessionUrl });
});

/**
 * POST /api/payments/webhook
 * Stripe sends events here. Raw body is required for signature verification.
 * This route MUST be mounted BEFORE express.json() in app.js.
 */
const webhook = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    throw new AppError("Missing stripe-signature header", 400, "MISSING_SIGNATURE");
  }

  let event;
  try {
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (err) {
    logger.warn("Stripe webhook signature verification failed", { error: err.message });
    throw new AppError(`Webhook Error: ${err.message}`, 400, "WEBHOOK_ERROR");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;
        await orderService.confirmPayment(orderId, session.id, paymentIntentId);
        logger.info("Webhook: checkout.session.completed", { orderId });
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await orderService.expireSession(orderId);
        logger.info("Webhook: checkout.session.expired", { orderId });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      // Find order by payment intent ID
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (order) {
        await orderService.failPayment(
          String(order._id),
          paymentIntent.last_payment_error?.message || "Payment failed"
        );
        logger.info("Webhook: payment_intent.payment_failed", { orderId: order._id });
      }
      break;
    }

    default:
      logger.debug("Unhandled Stripe event type", { type: event.type });
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
});

/**
 * GET /api/payments/config
 * Returns the Stripe publishable key for the frontend.
 */
const getConfig = catchAsync(async (_req, res) => {
  const publishableKey = stripeService.getPublishableKey();
  res.json({ publishableKey });
});

export { createCheckoutSession, webhook, getConfig };
