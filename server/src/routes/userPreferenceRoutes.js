const express = require("express");

const {
  getMyPreferences,
  addFavoriteGenre,
  addFavoriteAuthor,
} = require("../controllers/userPreferenceController");

const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getMyPreferences);

router.post("/genre", protect, addFavoriteGenre);

router.post("/author", protect, addFavoriteAuthor);

module.exports = router;