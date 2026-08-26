/**
 * pages/ai/SemanticSearch.jsx — AI-powered book search with natural language.
 */
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaBrain, FaSearch, FaSpinner, FaTimes, FaSlidersH, FaArrowRight,
} from "react-icons/fa";
import searchApi from "../../services/searchApi";
import SemanticSearchResults from "../components/SemanticSearchResults";
import SemanticSearchFilter from "../components/SemanticSearchFilter";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

const EXAMPLES = [
  "books for learning Python",
  "mind-bending sci-fi with big ideas",
  "calming books to read before sleep",
  "business strategy for startups",
  "history of ancient civilizations",
];

export default function SemanticSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [submitted, setSubmitted] = useState(!!searchParams.get("q"));

  const activeQuery = submitted ? query.trim() : "";
  const enabled = activeQuery.length >= 2;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["semantic-search", activeQuery, filters],
    queryFn: () =>
      searchApi.semantic({
        q: activeQuery,
        limit: 20,
        category: filters.category || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
      }),
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      setSubmitted(true);
    }
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!query.trim()) return;
      setSubmitted(true);
      const params = new URLSearchParams({ q: query.trim() });
      if (filters.category) params.set("category", filters.category);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      setSearchParams(params, { replace: true });
    },
    [query, filters, setSearchParams]
  );

  const handleExample = (ex) => {
    setQuery(ex);
    setSubmitted(true);
    setSearchParams({ q: ex }, { replace: true });
  };

  const handleClear = () => {
    setQuery("");
    setSubmitted(false);
    setFilters({ category: "", minPrice: "", maxPrice: "" });
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice;
  const results = data?.results || [];

  return (
    <div className="section space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-ink-900 dark:text-ink-50">
          <FaBrain className="mr-2 inline text-brand-600" />
          AI Book Search
        </h1>
        <p className="text-ink-500 dark:text-ink-400">
          Search for books using natural language. Describe what you want and find the best matches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex items-center">
          <FaSearch className="pointer-events-none absolute left-4 text-ink-400 dark:text-ink-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. books for learning Python"
            className="input w-full py-3 pl-12 pr-28 text-base"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-24 inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-200"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
          <button
            type="submit"
            disabled={!query.trim()}
            className="btn-primary absolute right-2 text-sm"
          >
            AI Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`btn text-sm ${showFilters || hasActiveFilters ? "btn-primary" : "btn-secondary"}`}
          >
            <FaSlidersH />
            Filters
            {hasActiveFilters && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
                {[filters.category, filters.minPrice, filters.maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>
          <span className="text-xs text-ink-400 dark:text-ink-500">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => handleExample(ex)}
              className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-ink-600 dark:bg-ink-100 dark:text-ink-300 dark:hover:border-brand-500 dark:hover:bg-ink-200"
            >
              {ex}
            </button>
          ))}
        </div>

        {showFilters && (
          <SemanticSearchFilter filters={filters} setFilters={setFilters} />
        )}
      </form>

      {enabled && (
        <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
          <span>
            Results for <strong className="text-ink-900 dark:text-ink-50">&ldquo;{activeQuery}&rdquo;</strong>
          </span>
          {isLoading && <Spinner className="h-4 w-4" />}
        </div>
      )}

      {enabled && isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-brand-600">
          <FaSpinner className="h-10 w-10 spin-slow" />
          <p className="text-sm font-medium">Reading your query and finding the closest books...</p>
        </div>
      )}

      {enabled && isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="font-medium text-red-800 dark:text-red-200">Search couldn&apos;t run</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            {error?.code === "ECONNABORTED"
              ? "Search timed out. The AI model is still loading — please try again in a few seconds."
              : error?.response?.data?.message || error?.message || "Something went wrong."}
          </p>
        </div>
      )}

      {!enabled && !submitted && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-4xl text-white shadow-lg">
            <FaBrain />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">
              Describe what you want to read
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">
              A sentence is enough — semantic search understands intent, mood, and topics.
              Try typing a query or pick one of the suggestions above.
            </p>
          </div>
        </div>
      )}

      {enabled && !isLoading && !isError && results.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-3xl text-ink-400 dark:bg-ink-200">
            <FaSearch />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">No close matches</h2>
            <p className="mt-1 max-w-md text-sm text-ink-500 dark:text-ink-400">
              Try rephrasing — shorter phrases or different wording often help.
            </p>
          </div>
        </div>
      )}

      {enabled && results.length > 0 && (
        <SemanticSearchResults results={results} />
      )}
    </div>
  );
}
