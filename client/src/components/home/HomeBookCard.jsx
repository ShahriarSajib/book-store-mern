/**
 * components/home/HomeBookCard.jsx
 * Landing-page-only book card with a hover reveal CTA.
 * Visually distinct from the catalog BookCard so the homepage feels curated.
 */
import { Link } from "react-router-dom";
import { FaBookOpen, FaCartPlus, FaStar } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

export default function HomeBookCard({ book, accent = "brand" }) {
  const id = book.id || book._id;
  const cover = book.coverImage || book.thumbnail;
  const inStock = (book.stock ?? 0) > 0;
  const accentBar =
    accent === "accent"
      ? "from-accent-500 to-accent-700"
      : accent === "gold"
        ? "from-gold to-amber-600"
        : accent === "rose"
          ? "from-rose-500 to-rose-700"
          : "from-brand-500 to-brand-700";

  return (
    <Link
      to={`/books/${id}`}
      className="home-card group"
      aria-label={`View ${book.title}`}
    >
      <div className="home-card__cover">
        <span className={`home-card__bar bg-gradient-to-br ${accentBar}`} aria-hidden />
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            loading="lazy"
            className="home-card__img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="home-card__placeholder">
            <FaBookOpen />
          </span>
        )}

        <div className="home-card__overlay" aria-hidden>
          <span className="home-card__cta">
            <FaCartPlus className="text-xs" /> View details
          </span>
        </div>

        {typeof book.averageRating === "number" && book.averageRating > 0 && (
          <span className="home-card__rating">
            <FaStar /> {book.averageRating.toFixed(1)}
          </span>
        )}

        <span
          className={`home-card__stock ${inStock ? "is-in" : "is-out"}`}
        >
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      <div className="home-card__body">
        <h3 className="home-card__title">{book.title}</h3>
        <p className="home-card__author">
          {book.authors?.length ? `by ${book.authors[0]}` : "Unknown author"}
        </p>
        <div className="home-card__foot">
          <span className="home-card__price">{formatCurrency(book.price)}</span>
          {book.category && (
            <span className="home-card__cat">{book.category}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
