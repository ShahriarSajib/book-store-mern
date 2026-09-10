import mongoose from "mongoose";

const recommendationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

recommendationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 14 * 24 * 60 * 60 });

export default mongoose.model(
  "RecommendationLog",
  recommendationLogSchema
);