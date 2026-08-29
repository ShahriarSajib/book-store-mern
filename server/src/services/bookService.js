/**
 * services/bookService.js — book CRUD, search, filter, sort, paginate,
 * view tracking, and stock updates. Owns the catalog business rules.
 */
import AppError from "../utils/AppError.js";
import * as repo from "../repositories/bookRepository.js";
import { getPagination, buildPageMeta } from "../utils/paginate.js";

const SORT_OPTIONS = {
  newest: { publishedYear: -1 },
  rating: { averageRating: -1 },
  popular: { ratingsCount: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  title: { title: 1 },
};

const DEFAULT_SORT = SORT_OPTIONS.rating;

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeBook(data) {
  const result = {};
  const stringFields = [
    "title",
    "subtitle",
    "publisher",
    "language",
    "edition",
    "isbn10",
    "isbn13",
    "coverImage",
    "description",
  ];
  const numberFields = [
    "publishedYear",
    "pages",
    "averageRating",
    "ratingsCount",
    "price",
    "stock",
  ];

  stringFields.forEach((field) => {
    if (data[field] !== undefined) {
      result[field] = String(data[field]).trim();
    }
  });
  numberFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== "") {
      result[field] = Number(data[field]);
    }
  });
  if (data.authors !== undefined) result.authors = toStringList(data.authors);
  if (data.categories !== undefined) result.categories = toStringList(data.categories);
  if (data.tags !== undefined) result.tags = toStringList(data.tags);
  if (data.isActive !== undefined) result.isActive = Boolean(data.isActive);

  return result;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter({ q, category, author, publisher, minPrice, maxPrice, inStock }) {
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.categories = new RegExp(`^${escapeRegex(category)}$`, "i");
  if (author) filter.authors = new RegExp(`^${escapeRegex(author)}$`, "i");
  if (publisher) filter.publisher = new RegExp(`^${escapeRegex(publisher)}$`, "i");
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }
  if (inStock === "true" || inStock === true) {
    filter.stock = { $gt: 0 };
  }
  return filter;
}

async function listBooks(query = {}) {
  const { page, limit, skip } = getPagination(query);
  const filter = buildFilter(query);

  let sort = SORT_OPTIONS[String(query.sort || "").replace(/^-/, "")] || DEFAULT_SORT;
  if (query.q && (!query.sort || query.sort === "relevance" || query.sort === "-relevance")) {
    sort = { score: { $meta: "textScore" } };
  }

  // The full-collection facet aggregation is only needed for the public
  // catalog sidebar. Admin lists pass withFacets=false to skip it.
  const withFacets = query.withFacets !== false && query.facet !== "false";

  const [result, facets] = await Promise.all([
    repo.findMany({ filter, sort, skip, limit }),
    withFacets ? repo.getFacets() : Promise.resolve({ categories: [], authors: [] }),
  ]);

  return {
    books: result.books,
    pagination: buildPageMeta(result.total, page, limit),
    facets,
  };
}

async function getBookById(id) {
  const book = await repo.findById(id);
  if (!book) {
    throw new AppError("Book not found", 404, "NOT_FOUND");
  }
  repo.incrementViewCount(id).catch(() => {});
  return book;
}

async function createBook(data) {
  const bookData = normalizeBook(data);
  if (!bookData.title) {
    throw new AppError("Title is required", 400, "VALIDATION_ERROR");
  }
  bookData.slug = slugify(bookData.title);
  return repo.create(bookData);
}

async function updateBook(id, data) {
  const bookData = normalizeBook(data);
  if (bookData.title) {
    bookData.slug = slugify(bookData.title);
  }
  const book = await repo.updateById(id, bookData);
  if (!book) {
    throw new AppError("Book not found", 404, "NOT_FOUND");
  }
  return book;
}

async function deleteBook(id) {
  const book = await repo.deleteById(id);
  if (!book) {
    throw new AppError("Book not found", 404, "NOT_FOUND");
  }
  return book;
}

async function adjustStock(id, quantity) {
  const book = await repo.decrementStock(id, quantity);
  if (!book) {
    throw new AppError(
      "Book is out of stock or has insufficient quantity",
      409,
      "INSUFFICIENT_STOCK"
    );
  }
  return book;
}

export {
  listBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  adjustStock,
};
