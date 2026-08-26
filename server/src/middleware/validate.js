/**
 * middleware/validate.js
 * Responsibility: run express-validator chains and short-circuit on errors.
 */
import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

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

export default validate;
