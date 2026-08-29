/**
 * services/catalogService.js — categories, authors, publishers CRUD.
 */
import AppError from "../utils/AppError.js";
import { Category, Author, Publisher, Book } from "../models/index.js";
import { getPagination, buildPageMeta } from "../utils/paginate.js";

const RESOURCES = {
  categories: { Model: Category, label: "Category", searchFields: ["name", "slug", "description"] },
  authors: { Model: Author, label: "Author", searchFields: ["name", "bio", "country"] },
  publishers: { Model: Publisher, label: "Publisher", searchFields: ["name", "slug", "country", "website"] },
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildSearchFilter(fields, term) {
  if (!term || !fields?.length) return null;
  const regex = new RegExp(escapeRegex(term.trim()), "i");
  return { $or: fields.map((f) => ({ [f]: regex })) };
}

async function listWithPagination(
  Model,
  { page = 1, limit = 50, includeInactive = false, searchFields = [], search = "" } = {}
) {
  const { skip } = getPagination({ page, limit });
  const clamped = Math.min(Math.max(Number(limit) || 50, 1), 100);

  const filter = { ...(includeInactive ? {} : { isActive: true }) };
  const searchFilter = buildSearchFilter(searchFields, search);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [items, total] = await Promise.all([
    Model.find(filter).sort({ name: 1 }).skip(skip).limit(clamped).lean(),
    Model.countDocuments(filter),
  ]);

  return { items, pagination: buildPageMeta(total, Number(page) || 1, clamped) };
}

function buildService(resource) {
  const { Model, label } = RESOURCES[resource];

  async function list(query = {}) {
    const { searchFields } = RESOURCES[resource];
    // Search via ?q= or ?search= ; optional pagination via ?page=&limit= .
    const search = query.search || query.q || "";
    if (query.page !== undefined || query.limit !== undefined || search) {
      return listWithPagination(Model, {
        page: query.page,
        limit: query.limit,
        includeInactive: query.all === "true",
        searchFields,
        search,
      });
    }
    return Model.find({ isActive: true }).sort({ name: 1 });
  }

  async function listAdmin() {
    return Model.find().sort({ name: 1 });
  }

  async function getById(id) {
    const doc = await Model.findById(id);
    if (!doc) throw new AppError(`${label} not found`, 404, "NOT_FOUND");
    return doc;
  }

  async function create(data) {
    const allowed = ["name", "description", "isActive", "image", "bio", "bornYear", "country", "website"];
    const payload = {};
    allowed.forEach((field) => {
      if (data[field] !== undefined) payload[field] = data[field];
    });
    if (!payload.name) throw new AppError(`${label} name is required`, 400, "VALIDATION_ERROR");
    return Model.create(payload);
  }

  async function update(id, data) {
    const doc = await Model.findById(id);
    if (!doc) throw new AppError(`${label} not found`, 404, "NOT_FOUND");
    const allowed = ["name", "description", "isActive", "image", "bio", "bornYear", "country", "website"];
    allowed.forEach((field) => {
      if (data[field] !== undefined) doc[field] = data[field];
    });
    await doc.save();
    return doc;
  }

  async function remove(id) {
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) throw new AppError(`${label} not found`, 404, "NOT_FOUND");
    return { success: true };
  }

  async function bookCount(id) {
    if (resource === "categories") {
      const doc = await Model.findById(id);
      return doc ? Book.countDocuments({ categories: doc.name }) : 0;
    }
    if (resource === "authors") {
      const doc = await Model.findById(id);
      return doc ? Book.countDocuments({ authors: doc.name }) : 0;
    }
    const doc = await Model.findById(id);
    return doc ? Book.countDocuments({ publisher: doc.name }) : 0;
  }

  return { list, listAdmin, getById, create, update, remove, bookCount };
}

export const categories = buildService("categories");
export const authors = buildService("authors");
export const publishers = buildService("publishers");
