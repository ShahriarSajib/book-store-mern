const {
  getTrendingBooks,
} = require("../services/trendingService");

async function getTrending(req, res) {
  try {
    const limit =
      Number(req.query.limit) || 10;

    const books =
      await getTrendingBooks(limit);

    return res.status(200).json({
      success: true,
      count: books.length,
      results: books,
    });
  } catch (error) {
    console.error(
      "Trending recommendation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate trending books.",
      error: error.message,
    });
  }
}

module.exports = {
  getTrending,
};