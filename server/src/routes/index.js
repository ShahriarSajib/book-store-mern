/**
 * routes/index.js — Mounts every resource under /api.
 * Order matters: specific route files before generic ones.
 */
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import bookRoutes from "./bookRoutes.js";
import catalogRoutes from "./catalogRoutes.js";
import searchRoutes from "./searchRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";
import cartRoutes from "./cartRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import orderRoutes from "./orderRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import couponRoutes from "./couponRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import chatbotRoutes from "./chatbotRoutes.js";
import faqRoutes from "./faqRoutes.js";
import adminRoutes from "./adminRoutes.js";
import uploadRoutes from "./uploadRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/books", bookRoutes);
router.use("/categories", catalogRoutes);
router.use("/authors", catalogRoutes);
router.use("/publishers", catalogRoutes);
router.use("/search", searchRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/cart", cartRoutes);
router.use("/notifications", notificationRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/coupons", couponRoutes);
router.use("/payments", paymentRoutes);
router.use("/chat", chatbotRoutes);
router.use("/faq", faqRoutes);
router.use("/admin", adminRoutes);
router.use("/upload", uploadRoutes);

router.get("/health", (_req, res) => res.json({ ok: true }));

export default router;
