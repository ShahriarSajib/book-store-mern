/**
 * components/recommendations/TrendingBookCard.jsx
 * Section 4 — "Trending Books" individual card.
 * Visual identity: bold flame palette to convey "hot right now".
 */
import { Link } from "react-router-dom";
import { FaFire, FaBookOpen } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

export default function TrendingBookCard({ book, rank }) {
  const id = book.id || book._id;
  return (
    <Link to={`/books/${id}`} className="trending-card">
      {rank != null && (
        <span className={`trending-card__rank trending-card__rank--${rank}`}>
          #{rank}
        </span>
      )}
      <div className="trending-card__cover">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <FaBookOpen className="trending-card__cover-icon" />
        )}
        <span className="trending-card__flame" aria-hidden>
          <FaFire />
        </span>
      </div>
      <div className="trending-card__body">
        <h4 className="trending-card__title">{book.title}</h4>
        {book.authors?.length > 0 && (
          <p className="trending-card__author">by {book.authors[0]}</p>
        )}
        <div className="trending-card__stats">
          {typeof book.trendingScore === "number" && (
            <span className="trending-card__score">
              <FaFire /> {Math.round(book.trendingScore)}
            </span>
          )}
          {typeof book.averageRating === "number" && book.averageRating > 0 && (
            <span className="trending-card__rating">★ {book.averageRating.toFixed(1)}</span>
          )}
          {typeof book.views === "number" && (
            <span className="trending-card__views">
              {book.views.toLocaleString()} views
            </span>
          )}
        </div>
        {book.price != null && (
          <p className="trending-card__price">{formatCurrency(book.price)}</p>
        )}
      </div>
    </Link>
  );
}
