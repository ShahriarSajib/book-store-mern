/**
 * services/couponService.js — validate coupon, apply to cart.
 */
import AppError from "../utils/AppError.js";
import { Coupon } from "../models/index.js";
import { getPagination, buildPageMeta } from "../utils/paginate.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function discountFor(coupon, subtotal) {
  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100;
    if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }
  return Math.min(discount, subtotal);
}

async function findValid(code, subtotal = 0) {
  const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
  if (!coupon) throw new AppError("Invalid coupon code", 404, "COUPON_NOT_FOUND");
  if (!coupon.isActive) throw new AppError("This coupon is no longer active", 400, "COUPON_INACTIVE");

  const now = Date.now();
  if (coupon.startsAt && now < new Date(coupon.startsAt).getTime()) {
    throw new AppError("This coupon is not active yet", 400, "COUPON_INACTIVE");
  }
  if (coupon.expiresAt && now > new Date(coupon.expiresAt).getTime()) {
    throw new AppError("This coupon has expired", 400, "COUPON_EXPIRED");
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError("This coupon has reached its usage limit", 400, "COUPON_LIMIT_REACHED");
  }
  if (subtotal > 0 && subtotal < coupon.minOrder) {
    throw new AppError(
      `Minimum order of ${coupon.minOrder.toLocaleString()} required for this coupon`,
      400,
      "COUPON_MIN_ORDER"
    );
  }
  return coupon;
}

async function apply(code, subtotal) {
  const coupon = await findValid(code, subtotal);
  const discount = discountFor(coupon, subtotal);
  return {
    coupon: { id: coupon._id, code: coupon.code, description: coupon.description },
    discount,
    subtotal,
    total: Math.max(0, subtotal - discount),
  };
}

async function trackUsage(code) {
  await Coupon.updateOne({ code: String(code).trim().toUpperCase() }, { $inc: { usedCount: 1 } });
}

async function listAdmin(query = {}) {
  const search = (query.search || query.q || "").trim();
  const filter = search
    ? { $or: [{ code: new RegExp(escapeRegex(search), "i") }, { description: new RegExp(escapeRegex(search), "i") }] }
    : {};

  const { page, limit } = getPagination({ page: query.page, limit: query.limit });
  const [coupons, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);

  return { coupons, pagination: buildPageMeta(total, page, limit) };
}

async function create(data) {
  const payload = {
    code: String(data.code || "").trim().toUpperCase(),
    description: data.description,
    type: data.type || "percent",
    value: Number(data.value),
    minOrder: data.minOrder != null ? Number(data.minOrder) : 0,
    maxDiscount: data.maxDiscount != null ? Number(data.maxDiscount) : undefined,
    startsAt: data.startsAt || undefined,
    expiresAt: data.expiresAt || undefined,
    usageLimit: data.usageLimit != null ? Number(data.usageLimit) : undefined,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  };
  if (!payload.code) throw new AppError("Coupon code is required", 400, "VALIDATION_ERROR");
  if (!(payload.value >= 0)) throw new AppError("Coupon value is required", 400, "VALIDATION_ERROR");
  return Coupon.create(payload);
}

async function update(id, data) {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError("Coupon not found", 404, "NOT_FOUND");
  ["description", "type", "value", "minOrder", "maxDiscount", "startsAt", "expiresAt", "usageLimit", "isActive"].forEach(
    (field) => {
      if (data[field] !== undefined) coupon[field] = data[field];
    }
  );
  if (data.code) coupon.code = String(data.code).trim().toUpperCase();
  await coupon.save();
  return coupon;
}

async function remove(id) {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new AppError("Coupon not found", 404, "NOT_FOUND");
  return { success: true };
}

export { findValid, apply, trackUsage, discountFor, listAdmin, create, update, remove };
