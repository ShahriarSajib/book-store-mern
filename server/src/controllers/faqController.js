/**
 * controllers/faqController.js — FAQ knowledge base CRUD + public search.
 */
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { FaqDocument } from "../models/index.js";
import { getPagination, buildPageMeta } from "../utils/paginate.js";

const list = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  const [total, items] = await Promise.all([
    FaqDocument.countDocuments(filter),
    FaqDocument.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ]);
  res.json({ items, pagination: buildPageMeta(total, page, limit) });
});

const search = catchAsync(async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ items: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const items = await FaqDocument.find({ isActive: true, $or: [{ question: rx }, { answer: rx }, { keywords: rx }] }).limit(10);
  res.json({ items });
});

const create = catchAsync(async (req, res) => {
  const { question, answer, category, keywords } = req.body;
  if (!question || !answer) {
    throw new AppError("Question and answer are required", 400, "VALIDATION_ERROR");
  }
  const item = await FaqDocument.create({ question, answer, category, keywords });
  res.status(201).json({ item });
});

const update = catchAsync(async (req, res) => {
  const item = await FaqDocument.findById(req.params.id);
  if (!item) throw new AppError("FAQ not found", 404, "NOT_FOUND");
  ["question", "answer", "category", "keywords", "isActive"].forEach((field) => {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  });
  await item.save();
  res.json({ item });
});

const remove = catchAsync(async (req, res) => {
  const item = await FaqDocument.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError("FAQ not found", 404, "NOT_FOUND");
  res.json({ success: true });
});

export { list, search, create, update, remove };
