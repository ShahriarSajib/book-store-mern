const Book = require("../models/Book");
const PopularityRecord = require("../models/PopularityRecord");

async function getTrendingBooks(limit = 10) {
  const books = await Book.find({
    isActive: true,
  }).lean();

  const popularityRecords =
    await PopularityRecord.find().lean();

  const popularityMap = new Map();

  popularityRecords.forEach((record) => {
    popularityMap.set(
      String(record.bookId),
      record
    );
  });

  const trendingBooks = books.map((book) => {
    const popularity =
      popularityMap.get(String(book._id)) || {};

    const views =
      Number(popularity.views || book.viewCount || 0);

    const purchases =
      Number(
        popularity.purchases ||
          book.purchaseCount ||
          0
      );

    const searches =
      Number(popularity.searches || 0);

    const recentActivity =
      Number(popularity.recentActivity || 0);

    const rating =
      Number(book.averageRating || 0);

    /*
      Trending Score

      Purchase  = strong signal
      View      = medium signal
      Search    = medium signal
      Rating    = quality signal
      Activity  = freshness signal
    */

    const score =
      purchases * 10 +
      views * 1 +
      searches * 3 +
      rating * 5 +
      recentActivity * 5;

    return {
      ...book,

      trendingScore: Number(
        score.toFixed(2)
      ),
    };
  });

  trendingBooks.sort(
    (a, b) =>
      b.trendingScore -
      a.trendingScore
  );

  return trendingBooks.slice(
    0,
    Number(limit)
  );
}

module.exports = {
  getTrendingBooks,
};