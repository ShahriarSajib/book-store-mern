/**
 * config/constants.js — shared client-side constants.
 */
export const ROLES = {
  GUEST: "guest",
  CUSTOMER: "customer",
  ADMIN: "admin",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: "cash_on_delivery",
  CARD: "card",
  BKASH: "bkash",
};