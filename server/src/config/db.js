/**
 * config/db.js — MongoDB connection helper.
 */
const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  console.log("[db] connected");
}

module.exports = connectDB;
