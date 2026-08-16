/**
 * controllers/uploadController.js — image upload for covers/avatars.
 */
const catchAsync = require("../utils/catchAsync");
const env = require("../config/env");

const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { message: "No file uploaded" } });
  }
  const base = `${env.SERVER_URL || `http://localhost:${env.PORT}`}/${env.UPLOAD_DIR}`;
  res.status(201).json({
    url: `${base}/${req.file.filename}`,
    filename: req.file.filename,
  });
});

module.exports = { uploadImage };
