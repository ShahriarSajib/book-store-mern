/**
 * models/Book.js
 * Responsibility:
 *   - Catalog schema (title, subtitle, authors[], categories[], publisher,
 *     language, edition, isbn10/isbn13, pages, price, stock, coverImage, tags).
 *   - Dataset-backed fields (publishedYear, averageRating, ratingsCount) from
 *     the Kaggle "7k books with metadata" dataset.
 *   - Aggregated review stats (averageRating, reviewCount) and engagement
 *     counters (viewCount, purchaseCount).
 *   - Embedding reference (embeddingId + optional cached vector).
 */
import mongoose from "mongoose";

function slugify(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    subtitle: { type: String, trim: true, maxlength: 500 },
    slug: { type: String, trim: true, lowercase: true, index: true },
    authors: { type: [String], default: [], index: true },
    categories: { type: [String], default: [], index: true },
    publisher: { type: String, trim: true, maxlength: 200 },
    language: { type: String, trim: true, default: "en" },
    edition: { type: String, trim: true, maxlength: 100 },
    isbn10: { type: String, trim: true, maxlength: 20 },
    isbn13: { type: String, trim: true, maxlength: 20, unique: true, sparse: true },
    coverImage: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 20000 },
    publishedYear: { type: Number },
    pages: { type: Number, min: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingsCount: { type: Number, min: 0, default: 0 },
    price: { type: Number, min: 0, default: 0 },
    stock: { type: Number, min: 0, default: 0 },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    reviewCount: { type: Number, min: 0, default: 0 },
    viewCount: { type: Number, min: 0, default: 0 },
    purchaseCount: { type: Number, min: 0, default: 0 },
    embeddingId: { type: String },
    embedding: { type: [Number], select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

bookSchema.virtual("id").get(function getVirtualId() {
  return this._id.toHexString();
});

bookSchema.pre("save", function preSaveSlug(next) {
  if (!this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

bookSchema.index({ title: "text", description: "text", tags: "text" });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ publishedYear: -1 });
bookSchema.index({ averageRating: -1, ratingsCount: -1 });

export default mongoose.model("Book", bookSchema);
