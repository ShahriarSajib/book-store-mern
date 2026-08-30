/**
 * models/Order.js
 * Responsibility: completed order records with items, totals,
 * shipping address, payment status, order status, tracking metadata.
 */
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    title: { type: String, trim: true, maxlength: 500 },
    coverImage: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    recipient: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: "Bangladesh", trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    coupon: {
      code: { type: String, trim: true, uppercase: true },
      discount: { type: Number, min: 0, default: 0 },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card", "bkash"],
      default: "cash_on_delivery",
    },
    stripeSessionId: { type: String, trim: true, index: true },
    stripePaymentIntentId: { type: String, trim: true },
    bkashPaymentId: { type: String, trim: true, index: true },
    bkashTrxId: { type: String, trim: true },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundReason: { type: String, trim: true, maxlength: 500 },

    shippingAddress: { type: addressSnapshotSchema, required: true },
    trackingNumber: { type: String, trim: true, index: { sparse: true, unique: true } },
    trackingProvider: { type: String, trim: true, maxlength: 50 },
    shippedAt: { type: Date },
    notes: { type: String, trim: true, maxlength: 1000 },

    cancelledAt: { type: Date },
    cancelReason: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

export default mongoose.model("Order", orderSchema);
