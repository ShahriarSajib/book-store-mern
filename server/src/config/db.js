/**
 * config/db.js — MongoDB connection helper.
 */
const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  mongoose.set("strictQuery", true);
  console.log("[db] connecting to MongoDB...");
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("[db] connected");
}

module.exports = connectDB;
