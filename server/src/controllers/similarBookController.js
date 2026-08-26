/**
 * controllers/similarBookController.js
 */

import {
  findSimilarBooks,
} from "../services/similarBookService.js";

const getSimilarBooks = async (req, res) => {
  try {
    const { bookId } = req.params;

    const {
      limit,
      category,
      minPrice,
      maxPrice,
    } = req.query;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "Book ID is required.",
      });
    }

    const books = await findSimilarBooks({
      bookId,
      limit: limit || 10,
      category,
      minPrice,
      maxPrice,
    });

    return res.status(200).json({
      success: true,
      bookId,
      count: books.length,
      results: books,
    });
  } catch (error) {
    console.error(
      "Similar books error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Failed to find similar books.",
    });
  }
};

export {
  getSimilarBooks,
};
