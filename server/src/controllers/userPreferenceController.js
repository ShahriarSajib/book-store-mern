const UserPreference = require("../models/UserPreference");
const catchAsync = require("../utils/catchAsync");

const getMyPreferences = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const preferences = await UserPreference.findOne({ userId }).lean();

  return res.json({
    success: true,
    preferences: preferences || {
      userId,
      favoriteGenres: [],
      favoriteAuthors: [],
      viewedBooks: [],
      wishlistBooks: [],
      purchasedBooks: [],
      ratedBooks: [],
      searchHistory: [],
    },
  });
});

const addFavoriteGenre = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const genre = String(req.body?.genre || "").trim();

  if (!genre) {
    return res.status(400).json({
      success: false,
      message: "Genre is required.",
    });
  }

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId }, $addToSet: { favoriteGenres: genre } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return res.status(200).json({
    success: true,
    preferences,
  });
});

const addFavoriteAuthor = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const author = String(req.body?.author || "").trim();

  if (!author) {
    return res.status(400).json({
      success: false,
      message: "Author is required.",
    });
  }

  const preferences = await UserPreference.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId }, $addToSet: { favoriteAuthors: author } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return res.status(200).json({
    success: true,
    preferences,
  });
});

module.exports = {
  getMyPreferences,
  addFavoriteGenre,
  addFavoriteAuthor,
};
