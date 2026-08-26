/**
 * models/Author.js
 * Responsibility: author profiles (biography, image).
 */
import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200, index: true },
    bio: { type: String, trim: true, maxlength: 5000 },
    image: { type: String, trim: true },
    bornYear: { type: Number, min: 1000, max: 3000 },
    country: { type: String, trim: true, maxlength: 100 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

export default mongoose.model("Author", authorSchema);
