/**
 * repositories/bookRepository.js
 * Responsibility: thin DB access layer for Book — find, paginate, facets,
 * create/update/delete, and stat/stock updates. Keeps services lean.
 */
import { Book } from "../models/index.js";

const PUBLIC_SELECT = "-embedding";

async function findById(id) {
  return Book.findById(id).select(PUBLIC_SELECT);
}

async function findMany({ filter = {}, sort = { averageRating: -1 }, skip = 0, limit = 20 }) {
  const [books, total] = await Promise.all([
    Book.find(filter).sort(sort).skip(skip).limit(limit).select(PUBLIC_SELECT),
    Book.countDocuments(filter),
  ]);
  return { books, total };
}

const FACET_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let facetCache = null;
let facetCacheLoadedAt = 0;
let facetLoadingPromise = null;

const computeFacets = async (top = 30) => {
  const [categories, authors] = await Promise.all([
    Book.aggregate([
      { $unwind: { path: "$categories", preserveNullAndEmptyArrays: true } },
      { $match: { categories: { $ne: null } } },
      {
        $group: {
          _id: { $toLower: "$categories" },
          name: { $first: "$categories" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: top },
      { $project: { _id: 0, name: 1, count: 1 } },
    ]),
    Book.aggregate([
      { $unwind: { path: "$authors", preserveNullAndEmptyArrays: true } },
      { $match: { authors: { $ne: null } } },
      {
        $group: {
          _id: { $toLower: "$authors" },
          name: { $first: "$authors" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: top },
      { $project: { _id: 0, name: 1, count: 1 } },
    ]),
  ]);
  return { categories, authors };
}

async function getFacets(top = 30) {
  const now = Date.now();

  if (facetCache && now - facetCacheLoadedAt < FACET_CACHE_TTL_MS) {
    return facetCache;
  }

  if (!facetLoadingPromise) {
    facetLoadingPromise = computeFacets(top)
      .then((value) => {
        facetCache = value;
        facetCacheLoadedAt = Date.now();
        return value;
      })
      .finally(() => {
        facetLoadingPromise = null;
      });
  }

  return facetLoadingPromise;
}

const resetFacetCache = () => {
  facetCache = null;
  facetCacheLoadedAt = 0;
  facetLoadingPromise = null;
};

async function create(data) {
  resetFacetCache();
  return Book.create(data);
}

async function updateById(id, data) {
  resetFacetCache();
  return Book.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select(PUBLIC_SELECT);
}

async function deleteById(id) {
  resetFacetCache();
  return Book.findByIdAndDelete(id);
}

async function incrementViewCount(id) {
  return Book.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true });
}

async function decrementStock(id, quantity) {
  return Book.findOneAndUpdate(
    { _id: id, stock: { $gte: quantity } },
    { $inc: { stock: -quantity, purchaseCount: 1 } },
    { new: true }
  );
}

export {
  findById,
  findMany,
  getFacets,
  create,
  updateById,
  deleteById,
  incrementViewCount,
  decrementStock,
};
