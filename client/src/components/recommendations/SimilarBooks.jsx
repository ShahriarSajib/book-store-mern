/**
 * components/recommendations/SimilarBooks.jsx
 * Section 2 — 📚 Books Similar to This.
 * "What is similar to this book?"
 * Visual identity: warm amber/orange theme — different from Search and Trending.
 *
 * Data flow: GET /api/similar-books/<bookId>?limit=8
 */
import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { useSimilarBooks } from "../../hooks/useRecommendations";
import SimilarBookCard from "./SimilarBookCard";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

export default function SimilarBooks({ bookId }) {
  const { data, isLoading, isError, error } = useSimilarBooks(bookId, { limit: 8 });

  const items = Array.isArray(data)
    ? data
    : data?.results || data?.books || data?.similar || [];

  return (
    <section className="rec rec--similar" aria-labelledby="similar-heading">
      <header className="rec__header">
        <span className="rec__icon rec__icon--similar" aria-hidden>
          <FaBookOpen />
        </span>
        <div>
          <p className="rec__eyebrow">What is similar to this book?</p>
          <h2 id="similar-heading" className="rec__title">
            📚 Books Similar to This
          </h2>
          <p className="rec__subtitle">
            Recommended based on the <em>content and meaning</em> of this book.
          </p>
        </div>
      </header>

      <div className="rec__body">
        {isLoading && (
          <div className="rec__state rec__state--loading" role="status">
            <Spinner className="h-5 w-5" />
            <span>Finding books that feel like this one…</span>
          </div>
        )}

        {isError && (
          <div className="rec__state rec__state--error" role="alert">
            <p className="font-medium">Couldn’t load similar books</p>
            <p className="text-xs">
              {error?.response?.data?.error?.message ||
                error?.message ||
                "Something went wrong."}
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon={FaBookOpen}
            title="No similar books yet"
            description="We don’t have enough indexed content to match this title right now."
          />
        )}

        {!isLoading && items.length > 0 && (
          <div className="similar-grid">
            {items.slice(0, 8).map((book) => (
              <SimilarBookCard
                key={book.id || book._id || book.title}
                book={book}
                reason={book.reason}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="rec__footer">
            <Link to="/books" className="rec__footer-link">
              Browse the full catalog →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}