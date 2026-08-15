const express = require("express");

const {
  searchBooks,
} = require("../controllers/semanticController");

const router = express.Router();

router.get("/", searchBooks);

module.exports = router;