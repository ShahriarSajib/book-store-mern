/**
 * services/paymentApi.js — Stripe payment API calls.
 */
import api from "./axios";

export const paymentApi = {
  createCheckoutSession: (orderId) =>
    api.post("/payments/create-checkout-session", { orderId }).then((r) => r.data),

  getConfig: () => api.get("/payments/config").then((r) => r.data),
};

export default paymentApi;
