/**
 * routes/orderRoutes.js — /api/orders/*
 *   POST /, GET /, GET /:id, PUT /:id/cancel, GET /:id/invoice
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect, requireVerified } = require("../middleware/auth");
const { orderValidators } = require("../validators");
const ctrl = require("../controllers/orderController");

router.use(protect);

router.post("/", requireVerified, validate(orderValidators.createOrderValidators), ctrl.createOrder);
router.get("/", ctrl.listOrders);
router.get("/:id/tracking", ctrl.getTracking);
router.get("/:id/invoice", ctrl.downloadInvoice);
router.get("/:id", ctrl.getOrder);
router.put("/:id/cancel", requireVerified, ctrl.cancelOrder);
router.post("/:id/reorder", requireVerified, ctrl.reorder);

module.exports = router;
