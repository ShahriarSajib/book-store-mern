/**
 * hooks/useRecommendations.js
 * One React-Query hook per section so loading/error/empty states are
 * isolated and never leak between sections.
 */
import { useQuery } from "@tanstack/react-query";
import recommendationApi from "../services/recommendationApi";

/** Section 2 — similar books for a specific bookId */
export function useSimilarBooks(bookId, { limit = 8, enabled = true } = {}) {
  return useQuery({
    queryKey: ["recommendations", "similar", bookId, limit],
    queryFn: () => recommendationApi.similar(bookId, { limit }),
    enabled: Boolean(bookId) && enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/** Section 3 — personalized (auth required) */
export function usePersonalized({ limit = 8, enabled = true } = {}) {
  return useQuery({
    queryKey: ["recommendations", "personalized", limit],
    queryFn: () => recommendationApi.personalized({ limit }),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

/** Section 4 — trending (public) */
export function useTrending({ limit = 8, enabled = true } = {}) {
  return useQuery({
    queryKey: ["recommendations", "trending", limit],
    queryFn: () => recommendationApi.trending({ limit }),
    enabled,
    staleTime: 1000 * 60,
  });
}

/** Auxiliary — recently viewed (auth required) */
export function useRecentlyViewed({ limit = 8, enabled = true } = {}) {
  return useQuery({
    queryKey: ["recommendations", "recently-viewed", limit],
    queryFn: () => recommendationApi.recentlyViewed({ limit }),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}