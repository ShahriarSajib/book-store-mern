/**
 * validators/bookValidators.js — express-validator chains for book routes.
 */
const { body, query } = require("express-validator");

const title = body("title")
  .trim()
  .notEmpty().withMessage("Title is required")
  .isLength({ max: 500 }).withMessage("Title must be under 500 characters");

const optionalTitle = body("title")
  .optional({ values: "null" })
  .trim()
  .notEmpty().withMessage("Title cannot be empty")
  .isLength({ max: 500 }).withMessage("Title must be under 500 characters");

const subtitle = body("subtitle")
  .optional({ values: "null" })
  .trim()
  .isLength({ max: 500 }).withMessage("Subtitle must be under 500 characters");

const authors = body("authors")
  .optional()
  .custom((value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === "string") return true;
    throw new Error("Authors must be a list or a single string");
  });

const categories = body("categories")
  .optional()
  .custom((value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === "string") return true;
    throw new Error("Categories must be a list or a single string");
  });

const price = body("price")
  .optional({ values: "null" })
  .isFloat({ min: 0 }).withMessage("Price must be 0 or more");

const stock = body("stock")
  .optional({ values: "null" })
  .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer");

const optionalNumber = (field, { min, max }) =>
  body(field)
    .optional({ values: "null" })
    .isFloat({ min, max }).withMessage(`${field} must be between ${min} and ${max}`);

const optionalString = (field, max) =>
  body(field)
    .optional({ values: "null" })
    .trim()
    .isLength({ max }).withMessage(`${field} must be under ${max} characters`);

const bool = (field) =>
  body(field)
    .optional()
    .isBoolean().withMessage(`${field} must be a boolean`);

const page = query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer");
const limit = query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1–100");
const q = query("q").optional().trim().isLength({ max: 100 }).withMessage("Search term is too long");
const minPrice = query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be 0 or more");
const maxPrice = query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be 0 or more");
const inStock = query("inStock").optional().isIn(["true", "false"]).withMessage("inStock must be true or false");

const sort = query("sort")
  .optional()
  .isIn(["relevance", "newest", "rating", "popular", "price_asc", "price_desc", "title"])
  .withMessage("Invalid sort option");

const createBookValidators = [
  title,
  subtitle,
  authors,
  categories,
  optionalString("publisher", 200),
  optionalString("language", 20),
  optionalString("edition", 100),
  optionalString("isbn10", 20),
  optionalString("isbn13", 20),
  optionalString("coverImage", 2000),
  optionalString("description", 20000),
  optionalNumber("publishedYear", { min: 0, max: 3000 }),
  optionalNumber("pages", { min: 0, max: 100000 }),
  optionalNumber("averageRating", { min: 0, max: 5 }),
  optionalNumber("ratingsCount", { min: 0, max: 1e9 }),
  price,
  stock,
  body("tags").optional().isArray().withMessage("Tags must be a list"),
  bool("isActive"),
];

const updateBookValidators = [
  optionalTitle,
  subtitle,
  authors,
  categories,
  optionalString("publisher", 200),
  optionalString("language", 20),
  optionalString("edition", 100),
  optionalString("isbn10", 20),
  optionalString("isbn13", 20),
  optionalString("coverImage", 2000),
  optionalString("description", 20000),
  optionalNumber("publishedYear", { min: 0, max: 3000 }),
  optionalNumber("pages", { min: 0, max: 100000 }),
  optionalNumber("averageRating", { min: 0, max: 5 }),
  optionalNumber("ratingsCount", { min: 0, max: 1e9 }),
  price,
  stock,
  body("tags").optional().isArray().withMessage("Tags must be a list"),
  bool("isActive"),
];

const listBooksValidators = [page, limit, q, minPrice, maxPrice, inStock, sort];

module.exports = {
  createBookValidators,
  updateBookValidators,
  listBooksValidators,
};
