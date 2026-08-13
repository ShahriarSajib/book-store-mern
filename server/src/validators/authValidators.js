/**
 * validators/authValidators.js — express-validator chains for auth routes.
 */
const { body } = require("express-validator");

const name = body("name")
  .trim()
  .notEmpty().withMessage("Name is required")
  .isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters");

const email = body("email")
  .trim()
  .normalizeEmail()
  .notEmpty().withMessage("Email is required")
  .isEmail().withMessage("Please provide a valid email address");

const password = body("password")
  .notEmpty().withMessage("Password is required")
  .isLength({ min: 8 }).withMessage("Password must be at least 8 characters");

const strongPassword = body("password")
  .notEmpty().withMessage("Password is required")
  .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  .matches(/[A-Za-z]/).withMessage("Password must contain a letter")
  .matches(/[0-9]/).withMessage("Password must contain a number");

const confirmPassword = body("confirmPassword")
  .custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  });

const token = body("token").trim().notEmpty().withMessage("Token is required");

const registerValidators = [name, email, strongPassword, confirmPassword];
const loginValidators = [email, password];
const forgotPasswordValidators = [email];
const resetPasswordValidators = [token, strongPassword, confirmPassword];
const resendVerificationValidators = [email];

const changePasswordValidators = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  strongPassword,
  confirmPassword,
];

const updateProfileValidators = [
  body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters"),
  body("phone").optional().trim().isLength({ max: 20 }).withMessage("Phone is too long"),
  body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must be under 500 characters"),
  body("favoriteGenres").optional().isArray().withMessage("Favorite genres must be a list"),
];

module.exports = {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  resendVerificationValidators,
  changePasswordValidators,
  updateProfileValidators,
};
