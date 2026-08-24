/**
 * config/env.js — Single source of truth for environment variables.
 * Validates required vars on boot and exposes a typed object.
 */
require("dotenv").config();

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL,
  SERVER_URL: process.env.SERVER_URL,

  MONGO_URI: process.env.MONGO_URI,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB) || 5,

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 300,
  CHAT_RATE_LIMIT_MAX: Number(process.env.CHAT_RATE_LIMIT_MAX) || 30,

  LLM_PROVIDER: process.env.LLM_PROVIDER || "openai",
  LLM_API_KEY: process.env.LLM_API_KEY,
  LLM_MODEL: process.env.LLM_MODEL || "gpt-4o-mini",
  LLM_TEMPERATURE: Number(process.env.LLM_TEMPERATURE) || 0.2,
  LLM_MAX_TOKENS: Number(process.env.LLM_MAX_TOKENS) || 800,

  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || "sentence-transformers",
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "all-MiniLM-L6-v2",
  EMBEDDING_DIM: Number(process.env.EMBEDDING_DIM) || 384,
  VECTOR_BACKEND: process.env.VECTOR_BACKEND || "local",
  VECTOR_INDEX: process.env.VECTOR_INDEX || "book_embeddings",

  MAIL_HOST: process.env.MAIL_HOST || "smtp.example.com",
  MAIL_PORT: Number(process.env.MAIL_PORT) || 587,
  MAIL_USER: process.env.MAIL_USER || "",
  MAIL_PASS: process.env.MAIL_PASS || "",
  MAIL_FROM: process.env.MAIL_FROM || "AI Bookstore <no-reply@example.com>",

  LOW_STOCK_THRESHOLD: Number(process.env.LOW_STOCK_THRESHOLD) || 5,

  // Seeded by scripts/seedAdmin.js — no insecure defaults.
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
