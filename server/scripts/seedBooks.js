/**
 * scripts/seedBooks.js
 * Responsibility: bulk-load books from the Kaggle
 * "7k books with metadata" dataset (books.csv) into MongoDB.
 *
 * The CSV has no price/stock columns, so a random price ($5.99–$39.99)
 * and a stock of 100 are assigned per book. Upserts are keyed on isbn13,
 * so the script is idempotent and safe to re-run.
 *
 * Run with: node scripts/seedBooks.js
 * Optional: BOOKS_CSV_PATH=/path/to/books.csv CLEAR_BOOKS=1
 */
require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const { parse } = require("csv-parse/sync");
const fs = require("fs");

const { Book } = require("../src/models");

const CSV_PATH =
  process.env.BOOKS_CSV_PATH || path.join(__dirname, "..", "data", "books.csv");

function cleanString(value) {
  const v = String(value ?? "").trim();
  return v.length > 0 && v.toLowerCase() !== "nan" ? v : undefined;
}

function cleanNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function splitList(value) {
  return String(value ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomPrice() {
  return Math.round((5.99 + Math.random() * 34) * 100) / 100;
}

function randomStock() {
  const weights = [0, 1, 2, 3, 5, 10, 15, 20, 30, 50];
  return weights[Math.floor(Math.random() * weights.length)];
}

function toBookDoc(row) {
  const title = cleanString(row.title);
  const doc = {
    title,
    authors: splitList(row.authors),
    categories: splitList(row.categories),
    coverImage: cleanString(row.thumbnail),
    description: cleanString(row.description),
    publishedYear: cleanNumber(row.published_year),
    averageRating: cleanNumber(row.average_rating) ?? 0,
    ratingsCount: cleanNumber(row.ratings_count) ?? 0,
    pages: cleanNumber(row.num_pages),
    price: randomPrice(),
    stock: randomStock(),
    isActive: true,
  };

  const subtitle = cleanString(row.subtitle);
  if (subtitle) doc.subtitle = subtitle;
  const isbn10 = cleanString(row.isbn10);
  if (isbn10) doc.isbn10 = isbn10;
  const isbn13 = cleanString(row.isbn13);
  if (isbn13) doc.isbn13 = isbn13;

  if (title) doc.slug = slugify(title);
  return doc;
}

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    console.error("Run: python scripts/download_books_dataset.py");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("[seed:books] connected to MongoDB");

  if (process.env.CLEAR_BOOKS === "1") {
    const { deletedCount } = await Book.deleteMany({});
    console.log(`[seed:books] cleared books collection (${deletedCount} removed)`);
  }

  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
  console.log(`[seed:books] parsed ${rows.length} rows from ${CSV_PATH}`);

  const docs = rows.map(toBookDoc);
  const CHUNK = 500;
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < docs.length; i += CHUNK) {
    const chunk = docs.slice(i, i + CHUNK);
    const ops = chunk.map((doc) => ({
      updateOne: {
        filter: { isbn13: doc.isbn13 },
        update: { $set: doc },
        upsert: true,
      },
    }));
    const res = await Book.bulkWrite(ops, { ordered: false });
    inserted += res.upsertedCount;
    updated += res.modifiedCount;
    console.log(
      `[seed:books] ${Math.min(i + CHUNK, docs.length)}/${docs.length} ` +
        `(upserted: ${res.upsertedCount}, modified: ${res.modifiedCount})`
    );
  }

  const total = await Book.countDocuments();
  console.log(`[seed:books] done — inserted: ${inserted}, updated: ${updated}, total books: ${total}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[seed:books] failed:", err.message);
  process.exit(1);
});
