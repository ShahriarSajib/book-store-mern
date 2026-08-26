/**
 * validators/orderValidators.js — express-validator chains for order routes.
 */
import { body } from "express-validator";

const createOrderValidators = [
  body("shippingAddressId").optional().isMongoId().withMessage("Invalid shipping address"),
  body("paymentMethod")
    .optional()
    .isIn(["cash_on_delivery", "card", "bkash"])
    .withMessage("Invalid payment method"),
  body("notes").optional().trim().isLength({ max: 1000 }),
  body("shippingAddress").optional().isObject().withMessage("Shipping address must be an object"),
  body("shippingAddress.recipient").optional().trim().notEmpty().withMessage("Recipient name is required"),
  body("shippingAddress.phone").optional().trim().notEmpty().withMessage("Phone number is required"),
  body("shippingAddress.street").optional().trim().notEmpty().withMessage("Street is required"),
  body("shippingAddress.city").optional().trim().notEmpty().withMessage("City is required"),
];

export { createOrderValidators };
