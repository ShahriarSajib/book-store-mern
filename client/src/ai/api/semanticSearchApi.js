const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001";

export const semanticSearch = async ({
  query,
  limit = 10,
  category = "",
  minPrice = "",
  maxPrice = "",
}) => {
  const params = new URLSearchParams();

  params.append("q", query);
  params.append("limit", limit);

  if (category) {
    params.append("category", category);
  }

  if (minPrice !== "") {
    params.append("minPrice", minPrice);
  }

  if (maxPrice !== "") {
    params.append("maxPrice", maxPrice);
  }

  const response = await fetch(
    `${API_URL}/api/semantic-search?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Semantic search failed"
    );
  }

  return data;
};