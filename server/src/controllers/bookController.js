/**
 * controllers/bookController.js — HTTP layer for book CRUD + public catalog.
 * Delegates to bookService.
 */
const catchAsync = require("../utils/catchAsync");
const bookService = require("../services/bookService");

const list = catchAsync(async (req, res) => {
  const result = await bookService.listBooks(req.query);
  res.json(result);
});

const getById = catchAsync(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  res.json({ book });
});

const create = catchAsync(async (req, res) => {
  const book = await bookService.createBook(req.body);
  res.status(201).json({ book });
});

const update = catchAsync(async (req, res) => {
  const book = await bookService.updateBook(req.params.id, req.body);
  res.json({ book });
});

const remove = catchAsync(async (req, res) => {
  await bookService.deleteBook(req.params.id);
  res.json({ success: true });
});

module.exports = { list, getById, create, update, remove };
