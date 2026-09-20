import apiBase from "../../config/api";

const API_URL = `${apiBase}/ai/recommendations`;

export async function getPersonalizedRecommendations(
  token,
  limit = 10
) {
  let response;
  try {
    response = await fetch(
      `${API_URL}/personalized?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    throw new Error("Network error — could not reach the server");
  }

  const data = await response.json().catch(() => ({}));

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
  let response;
  try {
    response = await fetch(
      `${API_URL}/trending?limit=${limit}`
    );
  } catch {
    throw new Error("Network error — could not reach the server");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load trending books"
    );
  }

  return data.results || [];
}
