/**
 * models/Cart.js
 * Responsibility: per-user cart (items, quantities, totals).
 * One cart per user. Updated by cart service; never touched by LLM directly.
 */
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, max: 100, default: 1 },
    price: { type: Number, min: 0, default: 0 },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
    coupon: {
      code: { type: String, trim: true, uppercase: true },
      discount: { type: Number, min: 0, default: 0 },
    },
  },
  { timestamps: true }
);

cartSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  obj.id = obj._id;
  obj.total = obj.items.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  obj.totalAfterDiscount = Math.max(0, obj.total - (obj.coupon?.discount || 0));
  return obj;
};

export default mongoose.model("Cart", cartSchema);
