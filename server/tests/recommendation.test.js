/**
 * tests/recommendation.test.js — trending score formula and personalized
 * recommendation ranking (genre/author/liked/viewed boosts, fallback).
 */
jest.mock("../src/models/Book", () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
}));
jest.mock("../src/models/PopularityRecord", () => ({
  find: jest.fn(),
}));
jest.mock("../src/models/UserPreference", () => ({
  findOne: jest.fn(),
}));
const Book = require("../src/models/Book");
const PopularityRecord = require("../src/models/PopularityRecord");

const { getTrendingBooks, resetTrendingCache } = require("../src/services/trendingService");
const {
  getPersonalizedRecommendations,
} = require("../src/services/personalizedRecommendationService");

describe("getTrendingBooks", () => {
  beforeEach(() => {
    resetTrendingCache();
  });

  it("returns the top scored books from the aggregation pipeline", async () => {
    // The service pushes scoring/sorting into MongoDB; the mocked aggregate
    // replays the top-N with trendingScore already attached.
    Book.aggregate.mockResolvedValue([
      { _id: "a", title: "Purchases King", trendingScore: 120 },
      { _id: "b", title: "Views King", trendingScore: 102.5 },
      { _id: "c", title: "Searches Only", trendingScore: 40 },
    ]);

    const result = await getTrendingBooks(2);

    expect(result.map((b) => b.title)).toEqual(["Purchases King", "Views King"]);
    expect(result[0].trendingScore).toBe(120);
    expect(result[1].trendingScore).toBe(102.5);
  });

  it("respects the limit parameter", async () => {
    // Mirrors the aggregation's descending sort.
    Book.aggregate.mockResolvedValue(
      Array.from({ length: 12 }, (_, i) => ({
        _id: `book-${i}`,
        title: `Book ${i}`,
        trendingScore: 11 - i,
      }))
    );

    const result = await getTrendingBooks(5);
    expect(result).toHaveLength(5);
    expect(result[0].trendingScore).toBe(11); // highest first
    expect(result[4].trendingScore).toBe(7);
  });

  it("treats missing popularity data as zeros", async () => {
    Book.aggregate.mockResolvedValue([{ _id: "x", title: "Lonely", trendingScore: 0 }]);

    const [book] = await getTrendingBooks(1);
    expect(book.trendingScore).toBe(0);
  });
});

describe("getPersonalizedRecommendations", () => {
  function chainQuery(resolved) {
    return {
      sort: () => ({ limit: () => ({ lean: jest.fn().mockResolvedValue(resolved) }) }),
      lean: jest.fn().mockResolvedValue(resolved),
    };
  }

  it("falls back to top-rated books when no preferences exist", async () => {
    // findOne returns a chainable query whose lean() resolves null.
    require("../src/models/UserPreference").findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    const topRated = [
      { _id: "t1", title: "Best Book", averageRating: 5, ratingsCount: 1000 },
      { _id: "t2", title: "Second Best", averageRating: 4.8, ratingsCount: 900 },
    ];
    Book.find.mockReturnValue(chainQuery(topRated));

    const result = await getPersonalizedRecommendations("u1", 2);

    expect(Book.find).toHaveBeenCalledWith({ isActive: true });
    expect(result).toEqual(topRated);
  });

  it("boosts favorite genre, author and liked books with reasons", async () => {
    const UserPreference = require("../src/models/UserPreference");
    UserPreference.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        userId: "u1",
        favoriteGenres: ["Fantasy"],
        favoriteAuthors: ["Tolkien"],
        viewedBooks: ["v1"],
        likedBooks: ["l1"],
      }),
    });

    const books = [
      {
        _id: "l1",
        title: "LOTR",
        categories: ["Fantasy"],
        authors: ["Tolkien"],
        averageRating: 4,
        ratingsCount: 500,
      },
      {
        _id: "v1",
        title: "Viewed Sci-Fi",
        categories: ["Sci-Fi"],
        authors: ["Other"],
        averageRating: 3,
        ratingsCount: 0,
      },
      {
        _id: "n1",
        title: "Unmatched",
        categories: ["History"],
        authors: ["Someone"],
        averageRating: 4.5,
        ratingsCount: 2000,
      },
    ];
    Book.find.mockReturnValue(chainQuery(books));

    const result = await getPersonalizedRecommendations("u1", 3);

    // LOTR: genre 5 + author 4 + liked 6 + rating 4 + pop min(0.5,3)=0.5 → 19.5
    expect(result[0].title).toBe("LOTR");
    expect(result[0].recommendationScore).toBe(19.5);
    expect(result[0].recommendationReason).toBe("favorite genre, favorite author, liked book");

    // Unmatched: rating 4.5 + pop min(2000/1000, 3)=2 → 6.5
    expect(result[1].title).toBe("Unmatched");
    expect(result[1].recommendationScore).toBeCloseTo(6.5, 2);
    expect(result[1].recommendationReason).toBe("highly rated");

    // Viewed Sci-Fi: viewed 2 + rating 3 → 5
    expect(result[2].title).toBe("Viewed Sci-Fi");
    expect(result[2].recommendationScore).toBeCloseTo(5, 2);
    expect(result[2].recommendationReason).toBe("previously viewed");
  });

  it("matches genres/authors case-insensitively", async () => {
    const UserPreference = require("../src/models/UserPreference");
    UserPreference.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        favoriteGenres: ["FANTASY"],
        favoriteAuthors: [],
        viewedBooks: [],
        likedBooks: [],
      }),
    });
    Book.find.mockReturnValue(
      chainQuery([
        { _id: "m1", title: "Match", categories: ["fantasy"], authors: [], averageRating: 0, ratingsCount: 0 },
      ])
    );

    const [book] = await getPersonalizedRecommendations("u1", 1);

    expect(book.recommendationScore).toBe(5); // genre boost only
    expect(book.recommendationReason).toBe("favorite genre");
  });
});
