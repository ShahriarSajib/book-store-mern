/**
 * validators/userValidators.js — express-validator chains for user profile routes.
 */
import { body } from "express-validator";

const addressValidators = [
  body("label").optional().trim().isLength({ max: 40 }).withMessage("Label is too long"),
  body("recipient").trim().notEmpty().withMessage("Recipient name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("street").trim().notEmpty().withMessage("Street address is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("state").optional().trim(),
  body("postalCode").optional().trim(),
  body("country").optional().trim(),
  body("isDefault").optional().isBoolean().withMessage("isDefault must be a boolean"),
];

export { addressValidators };
