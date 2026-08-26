/**
 * validators/cartValidators.js — express-validator chains for cart routes.
 */
import { body } from "express-validator";

const addItemValidators = [
  body("bookId").isMongoId().withMessage("A valid book id is required"),
  body("quantity").optional().isInt({ min: 1, max: 100 }).withMessage("Quantity must be 1–100"),
];

const updateQuantityValidators = [
  body("quantity").isInt({ min: 1, max: 100 }).withMessage("Quantity must be 1–100"),
];

const couponCodeValidators = [
  body("code").trim().notEmpty().withMessage("Coupon code is required").isLength({ max: 50 }),
];

export { addItemValidators, updateQuantityValidators, couponCodeValidators };
