/**
 * validators/orderValidators.js — express-validator chains for order routes.
 */
const { body } = require("express-validator");

const createOrderValidators = [
  body("shippingAddressId").optional().isMongoId().withMessage("Invalid shipping address"),
  body("paymentMethod").optional().isIn(["cash_on_delivery", "card", "bkash"]).withMessage("Invalid payment method"),
  body("notes").optional().trim().isLength({ max: 1000 }),
];

module.exports = { createOrderValidators };
