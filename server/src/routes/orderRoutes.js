/**
 * routes/orderRoutes.js — /api/orders/*
 *   POST /, GET /, GET /:id, PUT /:id/cancel, GET /:id/invoice
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { orderValidators } = require("../validators");
const ctrl = require("../controllers/orderController");

router.use(protect);

router.post("/", validate(orderValidators.createOrderValidators), ctrl.createOrder);
router.get("/", ctrl.listOrders);
router.get("/:id/invoice", ctrl.downloadInvoice);
router.get("/:id", ctrl.getOrder);
router.put("/:id/cancel", ctrl.cancelOrder);

module.exports = router;
