/**
 * config/db.js — MongoDB connection helper.
 */
import mongoose from "mongoose";
import env from "./env.js";

async function connectDB() {
  mongoose.set("strictQuery", true);
  console.log("[db] connecting to MongoDB...");
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("[db] connected");
}

export default connectDB;
