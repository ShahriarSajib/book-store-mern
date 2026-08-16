/**
 * components/recommendations/SemanticSearch.jsx
 * Section 1 — 🔎 AI Semantic Search.
 *
 * Visual identity:
 *   - Indigo → violet gradient panel with a soft inner glow
 *   - Magnifier icon, "What am I looking for?" framing
 *   - Standalone: it owns the search experience and its results
 *
 * Data flow: GET /api/semantic-search?q=<query>
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaBrain,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaArrowRight,
  FaQuoteLeft,
} from "react-icons/fa";
import { useDebounce } from "../../hooks/useDebounce";
import searchApi from "../../services/searchApi";
import { formatCurrency } from "../../utils/format";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

const EXAMPLES = [
  "A gentle introduction to Python for beginners",
  "Mind-bending sci-fi with big ideas",
  "Calming books to read before sleep",
];

function BookChip({ book, onPick }) {
  return (
    <button
      type="button"
      onClick={() => onPick(book)}
      className="semantic-chip group"
    >
      <span className="semantic-chip__title">{book.title}</span>
      {book.authors?.length > 0 && (
        <span className="semantic-chip__author">by {book.authors[0]}</span>
      )}
      {book.price != null && (
        <span className="semantic-chip__price">{formatCurrency(book.price)}</span>
      )}
      <FaArrowRight className="semantic-chip__arrow" />
    </button>
  );
}

export default function SemanticSearchBox({ onPickBook, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const debounced = useDebounce(query, 350);
  const navigate = useNavigate();

  const enabled = debounced.trim().length >= 2;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["semantic-search", debounced],
    queryFn: () => searchApi.semantic({ q: debounced, limit: 12 }),
    enabled,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!initialQuery) return;
    setQuery(initialQuery);
  }, [initialQuery]);

  const results = data?.results || data?.books || data || [];

  const handlePick = (book) => {
    if (onPickBook) onPickBook(book);
    else navigate(`/books/${book.id || book._id}`);
  };

  return (
    <section className="rec rec--semantic" aria-labelledby="semantic-heading">
      <header className="rec__header">
        <span className="rec__icon rec__icon--semantic" aria-hidden>
          <FaSearch />
        </span>
        <div>
          <p className="rec__eyebrow">What am I looking for?</p>
          <h2 id="semantic-heading" className="rec__title">
            🔎 AI Semantic Search
          </h2>
          <p className="rec__subtitle">
            Find books based on the <em>meaning</em> of your search, not just exact
            keywords. Try describing what you want in plain language.
          </p>
        </div>
      </header>

      <div className="semantic-input-wrap">
        <FaSearch className="semantic-input-wrap__icon" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. ‘a calming book to read on a rainy afternoon’"
          className="semantic-input"
          aria-label="Semantic search query"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="semantic-input-wrap__clear"
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <div className="semantic-suggestions">
        <FaQuoteLeft className="semantic-suggestions__icon" aria-hidden />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-indigo-100/80">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setQuery(ex)}
              className="semantic-suggestions__chip"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="rec__body">
        {/* Loading (only after a query exists) */}
        {enabled && isLoading && (
          <div className="rec__state rec__state--loading" role="status">
            <FaSpinner className="spin-slow text-indigo-200" />
            <span>Reading your query and finding the closest books…</span>
          </div>
        )}

        {/* Error */}
        {enabled && isError && (
          <div className="rec__state rec__state--error" role="alert">
            <p className="font-medium">Search couldn’t run</p>
            <p className="text-xs">
              {error?.response?.data?.error?.message ||
                error?.message ||
                "Something went wrong."}
            </p>
          </div>
        )}

        {/* Empty / idle */}
        {!enabled && (
          <EmptyState
            icon={FaBrain}
            title="Describe what you want to read"
            description="A sentence is enough — semantic search understands intent, mood, and topics."
          />
        )}

        {enabled && !isLoading && !isError && results.length === 0 && (
          <EmptyState
            icon={FaSearch}
            title="No close matches"
            description="Try rephrasing — shorter phrases or different wording often help."
          />
        )}

        {/* Results */}
        {enabled && results.length > 0 && (
          <>
            <div className="semantic-results-meta">
              <span>
                <strong>{results.length}</strong> match
                {results.length === 1 ? "" : "es"} for &ldquo;{debounced}&rdquo;
              </span>
              {isFetching && <Spinner className="h-3.5 w-3.5" />}
            </div>
            <div className="semantic-results">
              {results.map((book) => (
                <BookChip
                  key={book.id || book._id || book.title}
                  book={book}
                  onPick={handlePick}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}