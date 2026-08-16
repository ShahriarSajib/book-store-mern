/**
 * routes/cartRoutes.js — /api/cart/*
 *   GET /, POST /, PUT /:bookId, DELETE /:bookId, DELETE / (clear)
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { cartValidators } = require("../validators");
const ctrl = require("../controllers/cartController");

router.use(protect);

router.get("/", ctrl.getCart);
router.post("/", validate(cartValidators.addItemValidators), ctrl.addItem);
router.put("/:bookId", validate(cartValidators.updateQuantityValidators), ctrl.updateItem);
router.delete("/:bookId", ctrl.removeItem);
router.delete("/", ctrl.clearCart);

module.exports = router;
