/**
 * middleware/upload.js
 * Responsibility: configure multer for cover images and other files.
 * Enforces MAX_UPLOAD_MB, mime-type whitelist, and safe filenames.
 */
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const env = require("../config/env");
const AppError = require("./../utils/AppError");

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

function fileFilter(_req, file, cb) {
  if (ALLOWED.has(file.mimetype)) return cb(null, true);
  return cb(new AppError("Only image uploads are allowed", 400, "UNSUPPORTED_TYPE"));
}

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: (env.MAX_UPLOAD_MB || 5) * 1024 * 1024 },
});

module.exports = { uploadImage };
