const {
  getPersonalizedRecommendations,
} = require(
  "../services/personalizedRecommendationService"
);

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const limit = Number(req.query.limit) || 10;

    const books =
      await getPersonalizedRecommendations({
        userId,
        limit,
      });

    return res.status(200).json({
      success: true,
      count: books.length,
      results: books,
    });
  } catch (error) {
    console.error(
      "Personalized recommendation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate recommendations.",
      error: error.message,
    });
  }
};

module.exports = {
  getRecommendations,
};