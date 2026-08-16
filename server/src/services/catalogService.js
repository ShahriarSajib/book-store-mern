/**
 * services/catalogService.js — categories, authors, publishers CRUD.
 */
const AppError = require("../utils/AppError");
const { Category, Author, Publisher, Book } = require("../models");

const RESOURCES = {
  categories: { Model: Category, label: "Category" },
  authors: { Model: Author, label: "Author" },
  publishers: { Model: Publisher, label: "Publisher" },
};

function buildService(resource) {
  const { Model, label } = RESOURCES[resource];

  async function list() {
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

module.exports = {
  categories: buildService("categories"),
  authors: buildService("authors"),
  publishers: buildService("publishers"),
};
