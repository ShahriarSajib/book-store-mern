/**
 * models/Publisher.js
 * Responsibility: publisher profiles + website.
 */
const mongoose = require("mongoose");

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const publisherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200, index: true },
    slug: { type: String, trim: true, lowercase: true, index: true },
    country: { type: String, trim: true, maxlength: 100 },
    website: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

publisherSchema.pre("save", function preSaveSlug(next) {
  if (!this.slug || this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
});

module.exports = mongoose.model("Publisher", publisherSchema);
