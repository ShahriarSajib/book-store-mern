/**
 * validators/couponValidators.js — express-validator chains for coupon routes.
 */
const { body } = require("express-validator");

const createCouponValidators = [
  body("code").trim().notEmpty().withMessage("Code is required").isLength({ max: 50 }),
  body("type").optional().isIn(["percent", "fixed"]).withMessage("Type must be percent or fixed"),
  body("value").isFloat({ min: 0 }).withMessage("Value must be 0 or more"),
  body("minOrder").optional().isFloat({ min: 0 }),
  body("maxDiscount").optional().isFloat({ min: 0 }),
  body("usageLimit").optional().isInt({ min: 0 }),
  body("expiresAt").optional().isISO8601().withMessage("Invalid expiry date"),
  body("startsAt").optional().isISO8601().withMessage("Invalid start date"),
  body("isActive").optional().isBoolean(),
];

module.exports = { createCouponValidators };
