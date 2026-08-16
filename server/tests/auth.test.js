/**
 * tests/auth.test.js — auth middleware regression tests.
 */
const express = require("express");
const request = require("supertest");

const { protect } = require("../src/middleware/auth");
const errorHandler = require("../src/middleware/errorHandler");

describe("auth middleware", () => {
  it("returns 401 for an invalid bearer token", async () => {
    const app = express();

    app.get("/protected", protect, (_req, res) => {
      res.json({ ok: true });
    });

    app.use(errorHandler);

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid.token");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_ACCESS_TOKEN");
    expect(response.body.error.message).toBe("Invalid or expired access token");
  });
});