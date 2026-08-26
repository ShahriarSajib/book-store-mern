/**
 * tests/setupEnv.js — guarantees required env vars exist for unit tests.
 * Runs before the test framework loads (jest setupFiles), so any module that
 * validates env at require-time (config/env.js) works without a real .env.
 */
process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "0";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bookstore_test";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
