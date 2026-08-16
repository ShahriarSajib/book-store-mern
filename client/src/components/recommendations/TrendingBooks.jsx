/**
 * components/recommendations/TrendingBooks.jsx
 * Section 4 — 🔥 Trending Books.
 * "What is popular right now?"
 * Visual identity: red/orange flame palette — high-energy "hot right now".
 *
 * Data flow: GET /api/ai/recommendations/trending (public)
 */
import { FaFire } from "react-icons/fa";
import { useTrending } from "../../hooks/useRecommendations";
import TrendingBookCard from "./TrendingBookCard";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

export default function TrendingBooks({ limit = 8 }) {
  const { data, isLoading, isError, error } = useTrending({ limit });

  const items = Array.isArray(data)
    ? data
    : data?.results || data?.books || data?.trending || [];

  return (
    <section className="rec rec--trending" aria-labelledby="trending-heading">
      <header className="rec__header">
        <span className="rec__icon rec__icon--trending" aria-hidden>
          <FaFire />
        </span>
        <div>
          <p className="rec__eyebrow">What is popular right now?</p>
          <h2 id="trending-heading" className="rec__title">
            🔥 Trending Books
          </h2>
          <p className="rec__subtitle">
            Popular books based on <strong>ratings, views, purchases, and recent activity</strong>.
          </p>
        </div>
      </header>

      <div className="rec__body">
        {isLoading && (
          <div className="rec__state rec__state--loading" role="status">
            <Spinner className="h-5 w-5" />
            <span>Reading the latest activity…</span>
          </div>
        )}

        {isError && (
          <div className="rec__state rec__state--error" role="alert">
            <p className="font-medium">Couldn’t load trending books</p>
            <p className="text-xs">
              {error?.response?.data?.error?.message ||
                error?.message ||
                "Something went wrong."}
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon={FaFire}
            title="Nothing trending yet"
            description="Check back soon — the chart updates as readers engage."
          />
        )}

        {!isLoading && items.length > 0 && (
          <div className="trending-grid">
            {items.slice(0, limit).map((book, idx) => (
              <TrendingBookCard
                key={book.id || book._id || book.title}
                book={book}
                rank={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}