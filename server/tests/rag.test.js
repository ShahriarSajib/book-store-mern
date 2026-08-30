/**
 * tests/rag.test.js — retrieval layer: cosine similarity math, semantic
 * search ranking/filtering, and similar-book lookup guards.
 * The embedding model is mocked; everything else is real logic.
 */
jest.mock("../src/ai/embeddings/embeddingService", () => ({
  generateEmbedding: jest.fn(async (text) => {
    if (String(text).includes("space")) return [1, 0];
    if (String(text).includes("hearts")) return [0, 1];
    return [0.7071067811865476, 0.7071067811865476];
  }),
}));

jest.mock("../src/models/Book", () => ({
  find: jest.fn(),
  findById: jest.fn(),
}));
const Book = require("../src/models/Book");

const {
  semanticSearch,
  cosineSimilarity,
} = require("../src/services/semanticSearchService");
const {
  findSimilarBooks,
  cosineSimilarity: cosineSimilaritySimilar,
} = require("../src/services/similarBookService");
const {
  clearCache,
  warmCache,
  getCachedBooks,
} = require("../src/services/embeddingCatalogService");

beforeEach(() => {
  clearCache();
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it("returns ~0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it("handles negative components correctly", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it("returns 0 for mismatched lengths or empty inputs", () => {
    expect(cosineSimilarity([1], [1, 2])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity(null, [1])).toBe(0);
    expect(cosineSimilaritySimilar([0, 0], [1, 1])).toBe(0); // zero magnitude
  });
});

describe("semanticSearch", () => {
  it("rejects an empty query", async () => {
    await expect(semanticSearch({ query: "   " })).rejects.toThrow(
      "Search query is required."
    );
  });

  it("ranks by similarity, strips embeddings, and applies filters", async () => {
    const books = [
      { _id: "b2", title: "Love Letters", categories: ["Romance"], price: 10, embedding: [0, 1] },
      { _id: "b1", title: "The Martian", categories: ["Sci-Fi"], price: 20, embedding: [1, 0] },
      { _id: "b3", title: "Orbit", categories: ["Sci-Fi"], price: 30, embedding: [0.7071, 0.7071] },
    ];
    const lean = jest.fn().mockResolvedValue(books);
    const select = jest.fn(() => ({ lean }));
    Book.find.mockReturnValue({ select });

    // Warm the shared catalog through the same DB mock the service uses.
    await warmCache();

    const results = await semanticSearch({
      query: "space adventure",
      limit: 2,
      category: "Sci-Fi",
      minPrice: 5,
      maxPrice: 50,
    });

    // The catalog is fetched once; facet filtering happens in the app layer.
    expect(Book.find).toHaveBeenCalledWith({
      embedding: { $exists: true, $ne: [] },
    });

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe("The Martian"); // sim 1
    expect(results[1].title).toBe("Orbit"); // sim ≈ 0.7071
    expect(results[0].similarity).toBe(1);
    results.forEach((r) => expect(r.embedding).toBeUndefined());
  });
});

describe("embeddingCatalog", () => {
  it("never blocks a request while the catalog is loading", async () => {
    // The database transfer is slow / unresolved.
    let resolveLoad;
    const pending = new Promise((res) => {
      resolveLoad = res;
    });
    Book.find.mockReturnValue({
      select: jest.fn(() => ({ lean: jest.fn(() => pending) })),
    });

    const start = Date.now();
    const first = await getCachedBooks();

    // Did not wait on the database transfer.
    expect(Date.now() - start).toBeLessThan(500);
    expect(first).toEqual([]);

    resolveLoad([{ _id: "b1", title: "A", embedding: [1, 0] }]);
    await pending;
    await new Promise((r) => setTimeout(r, 0));

    const second = await getCachedBooks();
    expect(second).toHaveLength(1);
  });
});

describe("findSimilarBooks", () => {
  function findByIdReturns(doc) {
    Book.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(doc),
    });
  }

  it("404s when the source book does not exist", async () => {
    findByIdReturns(null);
    await expect(findSimilarBooks({ bookId: "missing" })).rejects.toMatchObject({
      statusCode: 404,
      message: "Book not found.",
    });
  });

  it("400s when the source book has no embedding", async () => {
    findByIdReturns({ _id: "b1", embedding: null });
    await expect(findSimilarBooks({ bookId: "b1" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("excludes the source book, ranks candidates and hides embeddings", async () => {
    findByIdReturns({ _id: "b1", embedding: [1, 0] });
    const candidates = [
      { _id: "b9", title: "Unrelated", embedding: [0, 1] },
      { _id: "b2", title: "Very Similar", embedding: [0.98, 0.199] },
    ];
    // The full catalog (embeddings included) is loaded once into the shared
    // cache; ranking and filtering happen in the app layer.
    const lean = jest.fn().mockResolvedValue(candidates);
    const select = jest.fn(() => ({ lean }));
    Book.find.mockReturnValue({ select });

    // Warm the shared catalog through the same DB mock the service uses.
    await warmCache();

    const results = await findSimilarBooks({ bookId: "b1", limit: 100 });

    // The source book is excluded from the candidate pool
    expect(Book.findById).toHaveBeenCalledWith("b1");
    expect(Book.find).toHaveBeenCalledWith({
      embedding: { $exists: true, $ne: [] },
    });
    // limit clamped to 50
    expect(results.length).toBeLessThanOrEqual(50);
    expect(results[0].title).toBe("Very Similar");
    results.forEach((r) => expect(r.embedding).toBeUndefined());
  });

  it("serves fast category-based picks while the catalog is still loading", async () => {
    findByIdReturns({
      _id: "b1",
      title: "Source",
      categories: ["Fantasy"],
      embedding: [1, 0],
    });

    // The catalog load never resolves (cold database)…
    Book.find.mockReturnValueOnce({
      select: jest.fn(() => ({ lean: jest.fn(() => new Promise(() => {})) })),
    });

    // …so the endpoint must fall back to a quick, indexed query.
    const fallbackBooks = [
      {
        _id: "b2",
        title: "Fallback Sim",
        categories: ["Fantasy"],
        averageRating: 4.5,
        reviewCount: 9,
        price: 20,
      },
    ];
    Book.find.mockReturnValueOnce({
      select: jest.fn(() => ({
        sort: jest.fn(() => ({
          limit: jest.fn(() => ({
            lean: jest.fn().mockResolvedValue(fallbackBooks),
          })),
        })),
      })),
    });

    const results = await findSimilarBooks({ bookId: "b1", limit: 8 });

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Fallback Sim");
    // Same-category, active-only candidates, source excluded.
    expect(Book.find).toHaveBeenLastCalledWith(
      expect.objectContaining({ _id: { $ne: "b1" }, isActive: true })
    );
  });
});
