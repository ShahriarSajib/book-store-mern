/**
 * routes/searchRoutes.js — /api/search/*
 *   GET /                keyword + filters + sort + pagination
 *   GET /autocomplete
 */
const router = require("express").Router();
const { optionalAuth } = require("../middleware/auth");
const ctrl = require("../controllers/searchController");

router.get("/autocomplete", ctrl.autocomplete);
router.get("/", optionalAuth, ctrl.search);

module.exports = router;
