/**
 * services/paymentApi.js — Stripe + bKash payment API calls.
 */
import api from "./axios";

export const paymentApi = {
  createCheckoutSession: (orderId) =>
    api.post("/payments/create-checkout-session", { orderId }).then((r) => r.data),

  createBkashPayment: (orderId) =>
    api.post("/payments/bkash/create", { orderId }).then((r) => r.data),

  getBkashStatus: (paymentID) =>
    api.post("/payments/bkash/status", { paymentID }).then((r) => r.data),

  executeBkashPayment: (paymentID) =>
    api.post("/payments/bkash/execute", { paymentID }).then((r) => r.data),

  createBkashAgreement: (orderId) =>
    api.post("/payments/bkash/agreement", { orderId }).then((r) => r.data),

  getBkashAgreement: () =>
    api.get("/payments/bkash/agreement").then((r) => r.data),

  removeBkashAgreement: () =>
    api.delete("/payments/bkash/agreement").then((r) => r.data),

  getConfig: () => api.get("/payments/config").then((r) => r.data),
};

export default paymentApi;
