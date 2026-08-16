const {
  semanticSearch,
} = require("../services/semanticSearchService");

const searchBooks = async (req, res) => {
  try {
    const {
      q,
      limit,
      category,
      minPrice,
      maxPrice,
    } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const books = await semanticSearch({
      query: q,
      limit: limit || 10,
      category,
      minPrice,
      maxPrice,
    });

    return res.status(200).json({
      success: true,
      query: q,
      count: books.length,
      results: books,
    });
  } catch (error) {
    console.error("Semantic search error:", error);

    return res.status(500).json({
      success: false,
      message: "Semantic search failed.",
      error: error.message,
    });
  }
};

module.exports = {
  searchBooks,
};