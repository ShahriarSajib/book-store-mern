/**
 * services/stripeService.js — Stripe SDK wrapper.
 * Handles checkout sessions, webhooks, refunds, and config.
 */
const stripe = require("stripe");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

let stripeInstance = null;

function getClient() {
  if (!stripeInstance) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new AppError("Stripe is not configured", 500, "PAYMENT_NOT_CONFIGURED");
    }
    stripeInstance = stripe(env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

/**
 * Create a Stripe Checkout Session for an order.
 * @param {Object} order - The order document (must be populated with user info)
 * @param {string} successUrl - Redirect URL after successful payment
 * @param {string} cancelUrl - Redirect URL after cancelled payment
 * @returns {Object} { sessionId, sessionUrl }
 */
async function createCheckoutSession(order, successUrl, cancelUrl) {
  const client = getClient();

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.title || "Book",
        ...(item.coverImage ? { images: [item.coverImage] } : {}),
      },
      unit_amount: Math.round(item.price * 100), // Stripe uses cents
    },
    quantity: item.quantity,
  }));

  // Add shipping as a line item if > 0
  if (order.shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Shipping" },
        unit_amount: Math.round(order.shipping * 100),
      },
      quantity: 1,
    });
  }

  // Add tax as a line item if > 0
  if (order.tax > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Tax" },
        unit_amount: Math.round(order.tax * 100),
      },
      quantity: 1,
    });
  }

  // Apply discount via discounts array (coupon)
  const discounts = [];
  if (order.coupon && order.coupon.discount > 0) {
    // Create a one-time coupon for this session
    const stripeCoupon = await client.coupons.create({
      amount_off: Math.round(order.coupon.discount * 100),
      currency: "usd",
      duration: "once",
      name: order.coupon.code || "Discount",
    });
    discounts.push({ coupon: stripeCoupon.id });
  }

  const sessionParams = {
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: order.user?.email || undefined,
    line_items: lineItems,
    metadata: {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      userId: String(order.user?._id || order.user),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  };

  if (discounts.length > 0) {
    sessionParams.discounts = discounts;
  }

  const session = await client.checkout.sessions.create(sessionParams);

  logger.info("Stripe checkout session created", {
    orderId: order._id,
    sessionId: session.id,
    amount: order.total,
  });

  return { sessionId: session.id, sessionUrl: session.url };
}

/**
 * Construct and verify a webhook event from raw body + signature.
 */
function constructWebhookEvent(body, signature) {
  const client = getClient();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError("Stripe webhook secret not configured", 500, "PAYMENT_NOT_CONFIGURED");
  }
  return client.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
}

/**
 * Refund a payment via Stripe.
 * @param {string} paymentIntentId
 * @param {string} reason - 'duplicate' | 'fraudulent' | 'requested_by_customer'
 * @returns {Object} refund object
 */
async function refundPayment(paymentIntentId, reason = "requested_by_customer") {
  const client = getClient();
  const refund = await client.refunds.create({
    payment_intent: paymentIntentId,
    reason,
  });
  logger.info("Stripe refund created", { paymentIntentId, refundId: refund.id });
  return refund;
}

/**
 * Retrieve a checkout session by ID.
 */
async function retrieveSession(sessionId) {
  const client = getClient();
  return client.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

/**
 * Get the publishable key for the frontend.
 */
function getPublishableKey() {
  if (!env.STRIPE_PUBLISHABLE_KEY) {
    throw new AppError("Stripe is not configured", 500, "PAYMENT_NOT_CONFIGURED");
  }
  return env.STRIPE_PUBLISHABLE_KEY;
}

module.exports = {
  createCheckoutSession,
  constructWebhookEvent,
  refundPayment,
  retrieveSession,
  getPublishableKey,
};
