import apiBase from "../../config/api";

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

  let response;
  try {
    response = await fetch(
      `${apiBase}/semantic-search?${params.toString()}`
    );
  } catch {
    throw new Error("Network error — could not reach the server");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Semantic search failed"
    );
  }

  return data;
};