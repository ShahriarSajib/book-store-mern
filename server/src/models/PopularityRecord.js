const mongoose = require("mongoose");

const popularityRecordSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      unique: true,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    purchases: {
      type: Number,
      default: 0,
    },

    searches: {
      type: Number,
      default: 0,
    },

    recentActivity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "PopularityRecord",
  popularityRecordSchema
);