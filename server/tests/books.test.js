/**
 * tests/books.test.js — book CRUD, catalog listing, auth gating, validation.
 * The repository and auth middleware are mocked so tests run without a DB.
 */
const express = require("express");
const request = require("supertest");

jest.mock("../src/repositories/bookRepository");
const repo = require("../src/repositories/bookRepository");

// Auth middleware stub: send "x-test-user: <id>:<role>" header to authenticate.
jest.mock("../src/middleware/auth", () => {
  const AppError = require("../src/utils/AppError");
  return {
    protect: (req, _res, next) => {
      const header = req.headers["x-test-user"];
      if (!header) {
        return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
      }
      const [id, role] = String(header).split(":");
      req.user = { id: id || "u1", role: role || "admin" };
      return next();
    },
    optionalAuth: (req, _res, next) => {
      const header = req.headers["x-test-user"];
      if (header) {
        const [id, role] = String(header).split(":");
        req.user = { id: id || "u1", role: role || "admin" };
      }
      return next();
    },
  };
});

const AppError = require("../src/utils/AppError");

jest.mock("../src/models", () => ({
  User: { updateOne: jest.fn().mockResolvedValue({}) },
}));

const errorHandler = require("../src/middleware/errorHandler");
const bookRoutes = require("../src/routes/bookRoutes");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/books", bookRoutes);
  app.use(errorHandler);
  return app;
}

const SAMPLE_BOOK = {
  _id: "b1",
  title: "Dune",
  authors: ["Frank Herbert"],
  categories: ["Sci-Fi"],
  price: 20,
  stock: 5,
  isActive: true,
};

describe("GET /api/books (public catalog)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.incrementViewCount.mockResolvedValue({});
  });

  it("returns books with pagination and facets", async () => {
    repo.findMany.mockResolvedValue({ books: [SAMPLE_BOOK], total: 1 });
    repo.getFacets.mockResolvedValue({
      categories: [{ name: "Sci-Fi", count: 1 }],
      authors: [{ name: "Frank Herbert", count: 1 }],
    });

    const res = await request(buildApp()).get("/api/books?page=2&limit=5").expect(200);

    expect(res.body.books).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ total: 1, page: 2, limit: 5, pages: 1 });
    expect(res.body.facets.categories[0]).toEqual({ name: "Sci-Fi", count: 1 });
    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, limit: 5 })
    );
  });

  it("builds a text-search filter and relevance sort for q=", async () => {
    repo.findMany.mockResolvedValue({ books: [], total: 0 });
    repo.getFacets.mockResolvedValue({ categories: [], authors: [] });

    await request(buildApp()).get("/api/books?q=dune").expect(200);

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({ $text: { $search: "dune" } }),
        sort: { score: { $meta: "textScore" } },
      })
    );
  });

  it("rejects an invalid sort option with VALIDATION_ERROR", async () => {
    const res = await request(buildApp()).get("/api/books?sort=bogus").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(repo.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/books/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repo.incrementViewCount.mockResolvedValue({});
  });

  it("returns the book when found", async () => {
    repo.findById.mockResolvedValue(SAMPLE_BOOK);
    const res = await request(buildApp()).get("/api/books/b1").expect(200);
    expect(res.body.book.title).toBe("Dune");
  });

  it("returns 404 NOT_FOUND when missing", async () => {
    repo.findById.mockRejectedValue(new AppError("Book not found", 404, "NOT_FOUND"));
    const res = await request(buildApp()).get("/api/books/nope").expect(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("POST /api/books (admin only)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requires authentication", async () => {
    await request(buildApp())
      .post("/api/books")
      .send({ title: "Dune" })
      .expect(401);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("forbids non-admin roles", async () => {
    await request(buildApp())
      .post("/api/books")
      .set("x-test-user", "u2:customer")
      .send({ title: "Dune" })
      .expect(403);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("creates a book and normalizes list fields + slug", async () => {
    repo.create.mockImplementation(async (data) => ({ _id: "b2", ...data }));

    const res = await request(buildApp())
      .post("/api/books")
      .set("x-test-user", "u1:admin")
      .send({ title: "The Hobbit!", authors: "Tolkien; Harper", price: "15.5", stock: "3" })
      .expect(201);

    expect(res.body.book.slug).toBe("the-hobbit");
    expect(res.body.book.authors).toEqual(["Tolkien", "Harper"]);
    expect(res.body.book.price).toBe(15.5);
    expect(res.body.book.stock).toBe(3);
  });

  it("returns 400 VALIDATION_ERROR when title is missing", async () => {
    const res = await request(buildApp())
      .post("/api/books")
      .set("x-test-user", "u1:admin")
      .send({ price: 10 })
      .expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.details.title).toBeDefined();
  });
});

describe("PUT/DELETE /api/books/:id (admin only)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates a book and regenerates slug from new title", async () => {
    repo.updateById.mockResolvedValue({ _id: "b1", title: "New Title", slug: "new-title" });

    const res = await request(buildApp())
      .put("/api/books/b1")
      .set("x-test-user", "u1:admin")
      .send({ title: "New Title" })
      .expect(200);

    expect(repo.updateById).toHaveBeenCalledWith("b1", expect.objectContaining({ slug: "new-title" }));
    expect(res.body.book.title).toBe("New Title");
  });

  it("deletes a book as admin", async () => {
    repo.deleteById.mockResolvedValue(SAMPLE_BOOK);
    const res = await request(buildApp())
      .delete("/api/books/b1")
      .set("x-test-user", "u1:admin")
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(repo.deleteById).toHaveBeenCalledWith("b1");
  });
});
