import apiBase from "../../config/api";

export async function getSimilarBooks(
  bookId,
  {
    limit = 10,
    category,
    minPrice,
    maxPrice,
  } = {}
) {
  const params = new URLSearchParams();

  params.set("limit", limit);

  if (category) {
    params.set("category", category);
  }

  if (minPrice !== undefined && minPrice !== "") {
    params.set("minPrice", minPrice);
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    params.set("maxPrice", maxPrice);
  }

  let response;
  try {
    response = await fetch(
      `${apiBase}/similar-books/${bookId}?${params.toString()}`
    );
  } catch {
    throw new Error("Network error — could not reach the server");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load similar books."
    );
  }

  return data;
}