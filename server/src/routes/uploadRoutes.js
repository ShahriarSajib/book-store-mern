/**
 * routes/uploadRoutes.js — /api/upload/*
 *   POST /image   (multipart, admin+)
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { uploadImage } = require("../middleware/upload");
const ctrl = require("../controllers/uploadController");

router.post("/image", protect, requireAdmin, uploadImage.single("file"), ctrl.uploadImage);

module.exports = router;
