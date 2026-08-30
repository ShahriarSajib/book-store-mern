import Book from "../models/Book.js";
import UserPreference from "../models/UserPreference.js";

async function getPersonalizedRecommendations(userId, limit = 10) {
  if (userId && typeof userId === "object") {
    limit = userId.limit ?? limit;
    userId = userId.userId;
  }

  const preference = await UserPreference.findOne({
    userId,
  }).lean();

  if (!preference) {
    return Book.find({ isActive: true })
      .sort({
        averageRating: -1,
        ratingsCount: -1,
      })
      .limit(Number(limit))
      .lean();
  }

  const favoriteGenres = preference.favoriteGenres || [];
  const favoriteAuthors = preference.favoriteAuthors || [];

  const books = await Book.find({
    isActive: true,
  }).lean();

  const viewedBooks = new Set(
    (preference.viewedBooks || []).map((id) => String(id))
  );

  const likedBooks = new Set(
    (preference.likedBooks || []).map((id) => String(id))
  );

  const scoredBooks = books.map((book) => {
    let score = 0;
    const reasons = [];

    // Genre match
    const genreMatch = (book.categories || []).some((category) =>
      favoriteGenres.some(
        (genre) =>
          genre.toLowerCase() === category.toLowerCase()
      )
    );

    if (genreMatch) {
      score += 5;
      reasons.push("favorite genre");
    }

    // Author match
    const authorMatch = (book.authors || []).some((author) =>
      favoriteAuthors.some(
        (favAuthor) =>
          favAuthor.toLowerCase() === author.toLowerCase()
      )
    );

    if (authorMatch) {
      score += 4;
      reasons.push("favorite author");
    }

    // Previously liked
    if (likedBooks.has(String(book._id))) {
      score += 6;
      reasons.push("liked book");
    }

    // Previously viewed
    if (viewedBooks.has(String(book._id))) {
      score += 2;
      reasons.push("previously viewed");
    }

    // Rating signal
    score += Number(book.averageRating || 0);

    // Popularity signal
    score += Math.min(
      Number(book.ratingsCount || 0) / 1000,
      3
    );

    return {
      ...book,
      recommendationScore: Number(score.toFixed(2)),
      recommendationReason:
        reasons.length > 0
          ? reasons.join(", ")
          : "highly rated",
    };
  });

  scoredBooks.sort(
    (a, b) =>
      b.recommendationScore -
      a.recommendationScore
  );

  return scoredBooks.slice(0, Number(limit));
}

export {
  getPersonalizedRecommendations,
};
