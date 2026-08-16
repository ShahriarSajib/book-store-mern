/**
 * controllers/searchController.js — keyword + autocomplete endpoints.
 * Reuses the catalog book service so filters/sort/pagination stay consistent.
 */
const catchAsync = require("../utils/catchAsync");
const bookService = require("../services/bookService");
const { Book } = require("../models");

const search = catchAsync(async (req, res) => {
  const result = await bookService.listBooks(req.query);
  res.json(result);
});

const autocomplete = catchAsync(async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return res.json({ suggestions: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const books = await Book.find({ isActive: true, title: rx })
    .select("title coverImage averageRating price")
    .limit(8);
  res.json({ suggestions: books });
});

module.exports = { search, autocomplete };
