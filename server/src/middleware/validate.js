/**
 * middleware/validate.js
 * Responsibility: run express-validator chains and short-circuit on errors.
 */
const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

function validate(validations) {
  return async function runValidations(req, _res, next) {
    await Promise.all(validations.map((chain) => chain.run(req)));
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const details = result.array().reduce((acc, err) => {
      acc[err.path] = err.msg;
      return acc;
    }, {});
    return next(new AppError("Invalid input data", 400, "VALIDATION_ERROR", details));
  };
}

module.exports = validate;
