/**
 * controllers/reviewController.js — reviews per book.
 */
import catchAsync from "../utils/catchAsync.js";
import reviewService from "../services/reviewService.js";

const listForBook = catchAsync(async (req, res) => {
  res.json(await reviewService.listByBook(req.params.bookId, req.query));
});

const create = catchAsync(async (req, res) => {
  const review = await reviewService.create(req.user.id, req.body);
  res.status(201).json({ review });
});

const update = catchAsync(async (req, res) => {
  res.json({ review: await reviewService.update(req.user.id, req.params.id, req.body) });
});

const remove = catchAsync(async (req, res) => {
  res.json(await reviewService.remove(req.user.id, req.params.id));
});

export { listForBook, create, update, remove };
