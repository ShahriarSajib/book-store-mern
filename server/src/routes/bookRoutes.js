/**
 * routes/bookRoutes.js — /api/books/*
 *   Public: GET /, GET /:id
 *   Admin:  POST /, PUT /:id, DELETE /:id
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { bookValidators } = require("../validators");
const ctrl = require("../controllers/bookController");

router.get("/", validate(bookValidators.listBooksValidators), ctrl.list);
router.get("/:id", ctrl.getById);

router.post("/", protect, requireAdmin, validate(bookValidators.createBookValidators), ctrl.create);
router.put("/:id", protect, requireAdmin, validate(bookValidators.updateBookValidators), ctrl.update);
router.delete("/:id", protect, requireAdmin, ctrl.remove);

module.exports = router;
