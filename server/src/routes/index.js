/**
 * routes/index.js — Mounts every resource under /api.
 * Order matters: specific route files before generic ones.
 */
const router = require("express").Router();

router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/books", require("./bookRoutes"));
router.use("/categories", require("./catalogRoutes"));
router.use("/authors", require("./catalogRoutes"));
router.use("/publishers", require("./catalogRoutes"));
router.use("/search", require("./searchRoutes"));
router.use("/recommendations", require("./recommendationRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/notifications", require("./notificationRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/reviews", require("./reviewRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/chat", require("./chatbotRoutes"));
router.use("/faq", require("./faqRoutes"));
router.use("/admin", require("./adminRoutes"));
router.use("/upload", require("./uploadRoutes"));

router.get("/health", (_req, res) => res.json({ ok: true }));

module.exports = router;