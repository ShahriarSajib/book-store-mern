/**
 * controllers/searchController.js — keyword + autocomplete endpoints.
 * Reuses the catalog book service so filters/sort/pagination stay consistent.
 */
import catchAsync from "../utils/catchAsync.js";
import * as bookService from "../services/bookService.js";
import { Book, User } from "../models/index.js";

const search = catchAsync(async (req, res) => {
  const result = await bookService.listBooks(req.query);
  if (req.user?.id && req.query.q) {
    User.updateOne(
      { _id: req.user.id },
      {
        $push: {
          searchHistory: {
            $each: [String(req.query.q).slice(0, 200)],
            $slice: -20,
          },
        },
      }
    ).catch(() => {});
  }
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

export { search, autocomplete };
