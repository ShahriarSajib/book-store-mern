const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

const API_URL = `${API_BASE_URL}/api/ai/recommendations`;

export async function getPersonalizedRecommendations(
  token,
  limit = 10
) {
  const response = await fetch(
    `${API_URL}/personalized?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load recommendations"
    );
  }

  return data.results || [];
}

export async function getTrendingBooks(
  limit = 10
) {
  const response = await fetch(
    `${API_URL}/trending?limit=${limit}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load trending books"
    );
  }

  return data.results || [];
}
