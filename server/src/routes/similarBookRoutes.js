/**
 * routes/similarBookRoutes.js
 */

const express = require("express");

const {
  getSimilarBooks,
} = require("../controllers/similarBookController");

const router = express.Router();

// GET /api/similar-books/:bookId
router.get("/:bookId", getSimilarBooks);

module.exports = router;