/**
 * controllers/catalogController.js — categories/authors/publishers endpoints.
 */
import catchAsync from "../utils/catchAsync.js";
import * as catalogService from "../services/catalogService.js";

function serviceFor(req) {
  const base = req.baseUrl.split("/").pop();
  return catalogService[base] || catalogService.categories;
}

const list = catchAsync(async (req, res) => {
  const result = await serviceFor(req).list(req.query);
  if (result && result.pagination) {
    res.json(result);
  } else {
    res.json({ items: result });
  }
});

const getById = catchAsync(async (req, res) => {
  const item = await serviceFor(req).getById(req.params.id);
  const count = await serviceFor(req).bookCount(req.params.id);
  res.json({ item, bookCount: count });
});

const create = catchAsync(async (req, res) => {
  const item = await serviceFor(req).create(req.body);
  res.status(201).json({ item });
});

const update = catchAsync(async (req, res) => {
  const item = await serviceFor(req).update(req.params.id, req.body);
  res.json({ item });
});

const remove = catchAsync(async (req, res) => {
  res.json(await serviceFor(req).remove(req.params.id));
});

export { list, getById, create, update, remove };
