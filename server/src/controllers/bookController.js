/**
 * controllers/bookController.js — HTTP layer for book CRUD + public catalog.
 * Delegates to bookService.
 */
import catchAsync from "../utils/catchAsync.js";
import * as bookService from "../services/bookService.js";
import { User } from "../models/index.js";

const list = catchAsync(async (req, res) => {
  const result = await bookService.listBooks(req.query);
  res.json(result);
});

const getById = catchAsync(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  if (req.user?.id) {
    User.updateOne(
      { _id: req.user.id },
      {
        $push: {
          browseHistory: { $each: [book._id], $slice: -50 },
        },
      }
    ).catch(() => {});
  }
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

export { list, getById, create, update, remove };
