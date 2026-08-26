import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    favoriteGenres: {
      type: [String],
      default: [],
    },

    favoriteAuthors: {
      type: [String],
      default: [],
    },

    viewedBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],

    likedBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "UserPreference",
  userPreferenceSchema
);