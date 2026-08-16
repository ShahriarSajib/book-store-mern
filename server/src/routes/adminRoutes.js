/**
 * routes/adminRoutes.js — /api/admin/*
 *   /dashboard, /users (admin-only user management),
 *   /inventory, /reviews, /coupons, /orders, /analytics, /ai
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const ctrl = require("../controllers/adminController");

router.use(protect, requireAdmin);

router.get("/dashboard", ctrl.getDashboard);

router.get("/users", ctrl.listUsers);
router.get("/users/:id", ctrl.getUser);
router.put("/users/:id", ctrl.updateUser);
router.delete("/users/:id", ctrl.deleteUser);

router.get("/inventory", ctrl.listInventory);
router.put("/inventory/:id", ctrl.updateStock);

router.get("/reviews", ctrl.listReviews);
router.put("/reviews/:id", ctrl.updateReview);
router.delete("/reviews/:id", ctrl.deleteReview);

router.get("/coupons", ctrl.listCoupons);
router.post("/coupons", ctrl.createCoupon);
router.put("/coupons/:id", ctrl.updateCoupon);
router.delete("/coupons/:id", ctrl.deleteCoupon);

router.get("/orders", ctrl.listOrders);
router.put("/orders/:id", ctrl.updateOrder);

router.get("/analytics/sales", ctrl.analyticsSales);
router.get("/analytics/inventory", ctrl.analyticsInventory);
router.get("/analytics/recommendations", ctrl.analyticsRecommendations);

router.post("/ai/chat", ctrl.aiChat);

module.exports = router;
