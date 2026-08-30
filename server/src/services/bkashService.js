/**
 * services/bkashService.js — bKash Tokenized Checkout (E-commerce) wrapper.
 *
 * Implements the documented tokenized flow:
 *   1. grantToken()        → id_token (short-lived, cached)
 *   2. createAgreement()   → mode "0000"; redirect customer to bkashURL to add
 *                            their wallet (one-time, OTP based)
 *   3. executeAgreement()  → after bKash's success callback, execute the
 *                            agreement and store the returned agreementID
 *   4. createPayment()     → mode "0001" + agreementID; redirect to bkashURL
 *   5. executePayment()    → after the success callback (must be called, per docs)
 *   6. queryPayment()      → fallback when Execute gives no response
 *
 * Refunds use the tokenized refund endpoint once a trxID exists.
 * Default bKash API timeout is 30s (per bKash docs).
 */
import axios from "axios";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const TIMEOUT_MS = 30000;

let cachedToken = null;

function isConfigured() {
  return Boolean(
    env.BKASH_APP_KEY && env.BKASH_APP_SECRET && env.BKASH_USERNAME && env.BKASH_PASSWORD
  );
}

function requireConfigured() {
  if (!isConfigured()) {
    throw new AppError("bKash is not configured", 500, "PAYMENT_NOT_CONFIGURED");
  }
  return env;
}

async function grantToken() {
  const cfg = requireConfigured();

  const { data } = await post(
    `${cfg.BKASH_BASE_URL}/tokenized/checkout/token/grant`,
    { app_key: cfg.BKASH_APP_KEY, app_secret: cfg.BKASH_APP_SECRET },
    {
      "Content-Type": "application/json",
      username: cfg.BKASH_USERNAME,
      password: cfg.BKASH_PASSWORD,
    }
  );

  if (!data?.id_token) {
    throw new AppError("bKash token grant failed", 502, "BKASH_TOKEN_ERROR");
  }

  cachedToken = data.id_token;
  logger.debug("bKash token granted");
  return cachedToken;
}

async function getToken() {
  if (cachedToken) return cachedToken;
  return grantToken();
}

/**
 * Wrapped POST against the tokenized API. Converts transport/provider
 * failures into a 502 AppError so controllers can render clean messages.
 */
async function post(url, body, headers = {}) {
  try {
    const { data } = await axios.post(url, body, {
      headers: { "Content-Type": "application/json", ...headers },
      timeout: TIMEOUT_MS,
    });
    if (data && typeof data === "object") {
      const errCode = data.errorCode;
      const errStatus = typeof data.statusCode === "string" ? data.statusCode : null;
      const hasErrorMessage = Boolean(data.errorMessage || data.statusMessage);
      if (errCode || (errStatus && errStatus !== "0000" && hasErrorMessage)) {
        throw new AppError(
          `bKash error ${errCode || errStatus}: ${data.errorMessage || data.statusMessage || "request failed"}`,
          502,
          "BKASH_API_ERROR"
        );
      }
    }
    return { data };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.warn("bKash API request failed", { url, error: error.message });
    throw new AppError("bKash is temporarily unavailable", 502, "BKASH_UNAVAILABLE");
  }
}

async function authorizedPost(path, body) {
  const cfg = requireConfigured();
  const token = await getToken();
  return post(`${cfg.BKASH_BASE_URL}${path}`, body, {
    Authorization: token,
    "X-APP-Key": cfg.BKASH_APP_KEY,
    Accept: "application/json",
  });
}

/**
 * Create a one-time bKash agreement (customer adds their wallet). Redirect the
 * customer to the returned bkashURL.
 * @param {Object} opts — { payerReference, callbackURL }
 * @returns {Object} { paymentID, bkashURL }
 */
async function createAgreement(opts) {
  const { data } = await authorizedPost("/tokenized/checkout/create", {
    mode: "0000",
    payerReference: opts.payerReference || "bookstore",
    callbackURL: opts.callbackURL,
  });

  if (!data?.paymentID) {
    throw new AppError("bKash agreement creation failed", 502, "BKASH_CREATE_ERROR");
  }

  logger.info("bKash agreement initiated", { paymentID: data.paymentID });
  return { paymentID: data.paymentID, bkashURL: data.bkashURL || null };
}

/**
 * Finalize an agreement (call after bKash's success callback with the
 * agreement-creation paymentID). Returns the stored agreementID.
 */
async function executeAgreement(paymentID) {
  const { data } = await authorizedPost("/tokenized/checkout/execute", { paymentID });
  logger.info("bKash agreement executed", {
    paymentID,
    status: data?.agreementStatus,
    agreementID: data?.agreementID,
  });
  return data;
}

/**
 * Create a bKash payment for an order using the customer's stored agreement.
 * @param {Object} opts — { amountBdt, payerReference, merchantInvoiceNumber, agreementID, callbackURL }
 * @returns {Object} { paymentID, bkashURL }
 */
async function createPayment(opts) {
  const { data } = await authorizedPost("/tokenized/checkout/create", {
    mode: "0001",
    agreementID: opts.agreementID,
    payerReference: opts.payerReference || "bookstore",
    callbackURL: opts.callbackURL,
    amount: String(opts.amountBdt),
    currency: "BDT",
    intent: "sale",
    merchantInvoiceNumber: opts.merchantInvoiceNumber,
  });

  if (!data?.paymentID) {
    throw new AppError("bKash payment creation failed", 502, "BKASH_CREATE_ERROR");
  }

  logger.info("bKash payment created", {
    paymentID: data.paymentID,
    amountBdt: opts.amountBdt,
    invoice: opts.merchantInvoiceNumber,
  });

  return { paymentID: data.paymentID, bkashURL: data.bkashURL || null };
}

/**
 * Execute a payment immediately (must be called after the customer completes
 * the bKash page — docs). Works for both agreements and payments via the same
 * endpoint.
 */
async function executePayment(paymentID) {
  const { data } = await authorizedPost("/tokenized/checkout/execute", { paymentID });
  logger.info("bKash payment executed", { paymentID, status: data?.transactionStatus });
  return data;
}

/**
 * Query the status of a bKash payment/agreement. Transactions are left in
 * "Initiated" until executed, "Completed" once done.
 */
async function queryPayment(paymentID) {
  const { data } = await authorizedPost("/tokenized/checkout/payment/status", { paymentID });
  return data;
}

/**
 * Refund a completed bKash payment.
 * @param {Object} opts — { paymentID, trxID, amountBdt, sku, reason }
 */
async function refundPayment(opts) {
  const { data } = await authorizedPost("/tokenized/checkout/payment/refund", {
    paymentID: opts.paymentID,
    amount: String(opts.amountBdt),
    trxID: opts.trxID,
    sku: opts.sku || "books",
    reason: opts.reason || "requested_by_customer",
  });

  logger.info("bKash refund created", { paymentID: opts.paymentID, refundTrxID: data?.refundTrxID });
  return data;
}

/**
 * Convert a USD order total to the integer BDT amount bKash expects.
 */
function toBdt(usdAmount) {
  const cfg = requireConfigured();
  return Math.round(usdAmount * cfg.BKASH_EXCHANGE_RATE_BDT_PER_USD);
}

/**
 * Hosted checkout page for an agreement/payment paymentID when the create
 * response omits bkashURL (sandbox commonly does).
 */
function checkoutUrl(paymentID) {
  try {
    const origin = new URL(env.BKASH_BASE_URL).origin;
    return `${origin}/frontend/checkout/${paymentID}`;
  } catch {
    return null;
  }
}

export {
  isConfigured,
  grantToken,
  getToken,
  createAgreement,
  executeAgreement,
  createPayment,
  executePayment,
  queryPayment,
  refundPayment,
  toBdt,
  checkoutUrl,
};