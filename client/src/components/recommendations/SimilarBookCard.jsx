/**
 * components/recommendations/SimilarBookCard.jsx
 * Section 2 — "Books Similar to This" individual card.
 * Visual identity: warm amber/orange theme — distinct from Search (brand)
 * and Trending (flame).
 */
import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

export default function SimilarBookCard({ book, reason }) {
  const id = book.id || book._id;
  return (
    <Link to={`/books/${id}`} className="similar-card">
      <div className="similar-card__cover">
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
          <FaBookOpen className="similar-card__cover-icon" />
        )}
        {typeof book.score === "number" && (
          <span className="similar-card__score" title="Similarity score">
            {Math.round(book.score * 100)}% match
          </span>
        )}
      </div>
      <div className="similar-card__body">
        <h4 className="similar-card__title">{book.title}</h4>
        {book.authors?.length > 0 && (
          <p className="similar-card__author">by {book.authors[0]}</p>
        )}
        <div className="similar-card__meta">
          {book.categories?.[0] && (
            <span className="similar-card__cat">{book.categories[0]}</span>
          )}
          {book.price != null && (
            <span className="similar-card__price">{formatCurrency(book.price)}</span>
          )}
        </div>
        {reason && <p className="similar-card__reason">{reason}</p>}
      </div>
    </Link>
  );
}
