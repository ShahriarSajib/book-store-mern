/**
 * scripts/seedCatalog.js
 * Responsibility: populate Category, Author and Publisher collections
 * from the distinct values present in the books collection.
 * Run with: node scripts/seedCatalog.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { Book, Category, Author, Publisher } = require("../src/models");

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("[seed:catalog] connected to MongoDB");

  const books = await Book.find({ isActive: true }).select("categories authors publisher");

  const categoryNames = new Set();
  const authorNames = new Set();
  const publisherNames = new Set();

  for (const b of books) {
    (b.categories || []).forEach((c) => c && categoryNames.add(c.trim()));
    (b.authors || []).forEach((a) => a && authorNames.add(a.trim()));
    if (b.publisher) publisherNames.add(b.publisher.trim());
  }

  async function bulkUpsert(Model, names, buildDoc) {
    const existing = new Set((await Model.find().select("name")).map((d) => d.name));
    const toInsert = [...names].filter((n) => !existing.has(n));
    if (!toInsert.length) return 0;
    await Model.bulkWrite(
      toInsert.map((name) => ({ insertOne: { document: buildDoc(name) } })),
      { ordered: false }
    );
    return toInsert.length;
  }

  const cats = await bulkUpsert(Category, categoryNames, (name) => ({ name, slug: slugify(name), description: "" }));
  const authors = await bulkUpsert(Author, authorNames, (name) => ({ name }));
  const publishers = await bulkUpsert(Publisher, publisherNames, (name) => ({ name, slug: slugify(name) }));

  console.log(`[seed:catalog] done — +${cats} categories, +${authors} authors, +${publishers} publishers`);
  console.log(
    `[seed:catalog] totals — categories: ${await Category.countDocuments()}, authors: ${await Author.countDocuments()}, publishers: ${await Publisher.countDocuments()}`
  );
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed:catalog] failed:", err.message);
  process.exit(1);
});
