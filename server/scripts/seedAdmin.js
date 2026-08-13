/**
 * scripts/seedAdmin.js
 * Responsibility: create the first admin user from env (ADMIN_EMAIL/ADMIN_PASSWORD).
 * Run with: node scripts/seedAdmin.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("../src/models");

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("[seed:admin] connected to MongoDB");

  const email = (process.env.ADMIN_EMAIL || "admin@bookstore.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Store Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.isActive = true;
    existing.isEmailVerified = true;
    if (process.env.ADMIN_PASSWORD) {
      existing.password = password;
    }
    await existing.save();
    console.log(`[seed:admin] updated existing admin: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`[seed:admin] created admin: ${email}`);
  }

  await mongoose.disconnect();
  console.log("[seed:admin] done");
}

seed().catch((err) => {
  console.error("[seed:admin] failed:", err.message);
  process.exit(1);
});
