/**
 * components/recommendations/PersonalizedBookCard.jsx
 * Section 3 — "Recommended For You" individual card.
 * Visual identity: emerald/teal gradient — the "for me" feel.
 */
import { Link } from "react-router-dom";
import { FaBookOpen, FaUserCheck } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

export default function PersonalizedBookCard({ book, matchReason }) {
  const id = book.id || book._id;
  return (
    <Link to={`/books/${id}`} className="personalized-card">
      <div className="personalized-card__cover">
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
          <FaBookOpen className="personalized-card__cover-icon" />
        )}
        <span className="personalized-card__badge">
          <FaUserCheck /> For you
        </span>
      </div>
      <div className="personalized-card__body">
        <h4 className="personalized-card__title">{book.title}</h4>
        {book.authors?.length > 0 && (
          <p className="personalized-card__author">by {book.authors[0]}</p>
        )}
        {matchReason && (
          <p className="personalized-card__reason">
            <span className="personalized-card__reason-dot" aria-hidden /> {matchReason}
          </p>
        )}
        <div className="personalized-card__meta">
          {book.price != null && (
            <span className="personalized-card__price">{formatCurrency(book.price)}</span>
          )}
          {typeof book.matchScore === "number" && (
            <span className="personalized-card__score">
              {Math.round(book.matchScore * 100)}% match
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
