/**
 * controllers/paymentController.js — Stripe checkout/webhook/config + bKash
 * tokenized checkout (create, callback, status, execute).
 */
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import stripeService from "../services/stripeService.js";
import * as bkashService from "../services/bkashService.js";
import * as orderService from "../services/orderService.js";
import logger from "../utils/logger.js";
import env from "../config/env.js";
import { Order, User } from "../models/index.js";

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

// ---------- bKash Tokenized Checkout ----------

const isValidId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

function serverBase(req) {
  return env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
}

function clientBase() {
  return env.CLIENT_URL || "http://localhost:5173";
}

async function findOrderByBkash(paymentID) {
  return Order.findOne({ bkashPaymentId: paymentID });
}

/**
 * Finalize a bKash payment: per docs, call Execute Payment after a success
 * callback; if Execute returns no usable response, fall back to Query Payment.
 */
async function finalizeBkashPayment(paymentID) {
  try {
    const executed = await bkashService.executePayment(paymentID);
    const status = executed?.transactionStatus;
    if (status === "Completed" || status === "Success") {
      return { status, trxID: executed.trxID };
    }
    if (status === "Initiated" || status === "Pending") {
      const q = await bkashService.queryPayment(paymentID);
      return { status: q?.transactionStatus || "Initiated", trxID: q?.trxID };
    }
    return { status: status || "Unknown", trxID: executed?.trxID };
  } catch (_err) {
    // Execute timed out or errored — Query Payment to learn the final state.
    const q = await bkashService.queryPayment(paymentID);
    return { status: q?.transactionStatus || "Unknown", trxID: q?.trxID };
  }
}

/**
 * POST /api/payments/bkash/create
 * Creates a bKash payment for an existing order (tokenized — uses the
 * customer's stored agreementID). If the customer hasn't linked a bKash
 * wallet yet, an agreement flow is started automatically and the response
 * signals the client to redirect.
 * Body: { orderId }
 */
const createBkashPayment = catchAsync(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw new AppError("orderId is required", 400, "VALIDATION_ERROR");

  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");

  const orderUserId = String(order.user?._id || order.user);
  if (orderUserId !== req.user.id) {
    throw new AppError("Not authorized", 403, "FORBIDDEN");
  }

  if (order.paymentMethod !== "bkash") {
    throw new AppError("This order is not set up for bKash payment", 400, "INVALID_PAYMENT_METHOD");
  }

  if (order.paymentStatus === "paid") {
    throw new AppError("Order is already paid", 400, "ALREADY_PAID");
  }

  const user = await User.findById(req.user.id).select("bkashAgreementId");
  const agreementID = user?.bkashAgreementId;

  // No stored wallet agreement → start the one-time linking flow first.
  if (!agreementID) {
    const agreement = await bkashService.createAgreement({
      payerReference: order.orderNumber,
      callbackURL: `${serverBase(req)}/api/payments/bkash/agreement/callback?user_id=${req.user.id}&order_id=${orderId}`,
    });
    const url = agreement.bkashURL || bkashService.checkoutUrl(agreement.paymentID);
    if (!url) throw new AppError("Could not build a bKash checkout URL", 502, "BKASH_CREATE_ERROR");
    logger.info("bKash agreement flow started for payment", { orderId, paymentID: agreement.paymentID });
    return res.json({ requiresAgreement: true, paymentID: agreement.paymentID, url });
  }

  const created = await bkashService.createPayment({
    amountBdt: bkashService.toBdt(order.total),
    payerReference: order.orderNumber,
    merchantInvoiceNumber: order.orderNumber,
    agreementID,
    callbackURL: `${serverBase(req)}/api/payments/bkash/callback`,
  });
  const paymentID = created.paymentID;
  order.bkashPaymentId = paymentID;
  await order.save();

  const url = created.bkashURL || bkashService.checkoutUrl(paymentID);
  if (!url) throw new AppError("Could not build a bKash checkout URL", 502, "BKASH_CREATE_ERROR");

  res.json({ paymentID, url });
});

/**
 * GET /api/payments/bkash/callback
 * bKash redirects the customer back here after the payment page with
 * ?paymentID=...&status=success|failure|cancel. Status is verified server-side
 * via Execute + Query Payment before touching the order.
 */
const bkashCallback = catchAsync(async (req, res) => {
  const { paymentID, status } = req.query;
  const base = clientBase();

  if (!paymentID) {
    return res.redirect(`${base}/payment/cancel`);
  }

  const order = await findOrderByBkash(paymentID);
  if (!order) {
    logger.warn("bkashCallback: no order for payment", { paymentID });
    return res.redirect(`${base}/payment/cancel`);
  }

  if (status !== "success") {
    await orderService.failPayment(
      String(order._id),
      status === "failure" ? "bKash payment failed" : "bKash payment cancelled"
    );
    return res.redirect(`${base}/payment/cancel?order_id=${order._id}`);
  }

  const result = await finalizeBkashPayment(paymentID);
  if (result.status === "Completed" || result.status === "Success") {
    await orderService.confirmPayment(String(order._id), null, null, {
      bkashPaymentId: paymentID,
      bkashTrxId: result.trxID || order.bkashTrxId,
    });
    logger.info("bKash payment confirmed via callback", { orderId: order._id, trxID: result.trxID });
    return res.redirect(`${base}/payment/success?order_id=${order._id}`);
  }

  logger.warn("bkashCallback: status != completed", { paymentID, transactionStatus: result.status });
  await orderService.failPayment(String(order._id), `bKash payment did not complete (${result.status})`);
  return res.redirect(`${base}/payment/cancel?order_id=${order._id}`);
});

/**
 * POST /api/payments/bkash/status
 * Query the status of a bKash payment (docs: Query Payment API), confirming
 * the order when Completed.
 * Body: { paymentID }
 */
const checkBkashStatus = catchAsync(async (req, res) => {
  const { paymentID } = req.body;
  if (!paymentID) throw new AppError("paymentID is required", 400, "VALIDATION_ERROR");

  const payment = await bkashService.queryPayment(paymentID);
  const order = await findOrderByBkash(paymentID);

  if (order && (payment?.transactionStatus === "Completed" || payment?.transactionStatus === "Success")) {
    await orderService.confirmPayment(String(order._id), null, null, {
      bkashPaymentId: paymentID,
      bkashTrxId: payment.trxID || order.bkashTrxId,
    });
  }

  res.json({
    paymentID,
    transactionStatus: payment?.transactionStatus || "Unknown",
    trxID: payment?.trxID || null,
    orderId: order ? String(order._id) : null,
  });
});

/**
 * POST /api/payments/bkash/execute
 * Execute a bKash payment immediately (ExecuteButton flow).
 * Body: { paymentID }
 */
const executeBkashPayment = catchAsync(async (req, res) => {
  const { paymentID } = req.body;
  if (!paymentID) throw new AppError("paymentID is required", 400, "VALIDATION_ERROR");

  const execution = await bkashService.executePayment(paymentID);
  const txnStatus = execution?.transactionStatus;

  const order = await findOrderByBkash(paymentID);
  if (order && (txnStatus === "Completed" || txnStatus === "Success")) {
    await orderService.confirmPayment(String(order._id), null, null, {
      bkashPaymentId: paymentID,
      bkashTrxId: execution.trxID || order.bkashTrxId,
    });
  }

  res.json({ paymentID, transactionStatus: txnStatus || "Unknown", orderId: order ? String(order._id) : null });
});

// ---------- bKash agreement (link customer wallet) ----------

/**
 * POST /api/payments/bkash/agreement
 * Start adding a bKash wallet for the logged-in customer (one-time OTP flow).
 * Body: { orderId? } — optional order to resume after linking.
 */
const createBkashAgreement = catchAsync(async (req, res) => {
  const { orderId } = req.body || {};
  if (orderId && !isValidId(orderId)) throw new AppError("Invalid orderId", 400, "VALIDATION_ERROR");

  const agreement = await bkashService.createAgreement({
    payerReference: orderId || String(req.user.id),
    callbackURL: `${serverBase(req)}/api/payments/bkash/agreement/callback?user_id=${req.user.id}${orderId ? `&order_id=${orderId}` : ""}`,
  });

  const url = agreement.bkashURL || bkashService.checkoutUrl(agreement.paymentID);
  if (!url) throw new AppError("Could not build a bKash checkout URL", 502, "BKASH_CREATE_ERROR");

  res.json({ paymentID: agreement.paymentID, url });
});

/**
 * GET /api/payments/bkash/agreement/callback
 * bKash redirects here after the wallet-linking page. On success the agreement
 * is executed and the returned agreementID is stored against the user.
 */
const bkashAgreementCallback = catchAsync(async (req, res) => {
  const { paymentID, status, user_id, order_id } = req.query;
  const base = clientBase();

  if (!paymentID || !isValidId(user_id)) {
    return res.redirect(`${base}/checkout?bkash=failed`);
  }

  const returnPath = order_id && isValidId(order_id)
    ? `/checkout?bkash=${status === "success" ? "linked" : "failed"}&order_id=${order_id}`
    : `/checkout?bkash=${status === "success" ? "linked" : "failed"}`;

  if (status !== "success") {
    logger.info("bKash agreement not completed", { user_id, paymentID, status });
    return res.redirect(`${base}${returnPath}`);
  }

  try {
    const executed = await bkashService.executeAgreement(paymentID);
    if (!executed?.agreementID) {
      logger.warn("bkashAgreementCallback: no agreementID returned", { paymentID, user_id });
      return res.redirect(`${base}/checkout?bkash=failed`);
    }
    await User.updateOne(
      { _id: user_id },
      { $set: { bkashAgreementId: executed.agreementID, bkashAgreementLinkedAt: new Date() } }
    );
    logger.info("bKash wallet linked", { user_id, agreementID: executed.agreementID });
    return res.redirect(`${base}${returnPath}`);
  } catch (_err) {
    logger.warn("bkashAgreementCallback: execute failed", { paymentID, user_id });
    return res.redirect(`${base}/checkout?bkash=failed`);
  }
});

/**
 * GET /api/payments/bkash/agreement
 * Returns whether the current user has a linked bKash wallet.
 */
const getBkashAgreement = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select("bkashAgreementId bkashAgreementLinkedAt");
  res.json({
    linked: Boolean(user?.bkashAgreementId),
    linkedAt: user?.bkashAgreementLinkedAt || null,
  });
});

/**
 * DELETE /api/payments/bkash/agreement
 * Unlinks the stored bKash agreement from the current user's account.
 */
const removeBkashAgreement = catchAsync(async (req, res) => {
  await User.updateOne(
    { _id: req.user.id },
    { $unset: { bkashAgreementId: "", bkashAgreementLinkedAt: "" } }
  );
  res.json({ linked: false });
});

export {
  createCheckoutSession,
  webhook,
  getConfig,
  createBkashPayment,
  bkashCallback,
  checkBkashStatus,
  executeBkashPayment,
  createBkashAgreement,
  bkashAgreementCallback,
  getBkashAgreement,
  removeBkashAgreement,
};
