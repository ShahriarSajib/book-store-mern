/**
 * models/FaqDocument.js
 * Responsibility: knowledge base entries for RAG
 * (shipping, payment, returns, refunds, policies, account help).
 * Vector ID + content + metadata stored here.
 */
const mongoose = require("mongoose");

const faqDocumentSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, trim: true, maxlength: 100, index: true },
    keywords: [{ type: String, trim: true }],
    embeddingId: { type: String },
    embedding: { type: [Number], select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

faqDocumentSchema.index({ question: "text", answer: "text", keywords: "text" });

module.exports = mongoose.model("FaqDocument", faqDocumentSchema);
