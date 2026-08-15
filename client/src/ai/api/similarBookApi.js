const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5001";

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

  const response = await fetch(
    `${API_BASE_URL}/api/similar-books/${bookId}?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load similar books."
    );
  }

  return data;
}