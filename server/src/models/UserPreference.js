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

    viewedBooks: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
      ],
      default: [],
      validate: {
        validator: (v) => v.length <= 50,
        message: "viewedBooks cannot exceed 50 entries",
      },
    },

    likedBooks: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
        },
      ],
      default: [],
      validate: {
        validator: (v) => v.length <= 50,
        message: "likedBooks cannot exceed 50 entries",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "UserPreference",
  userPreferenceSchema
);