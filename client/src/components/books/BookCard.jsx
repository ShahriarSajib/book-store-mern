/**
 * components/books/BookCard.jsx — catalog card linking to the book detail page.
 */
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

export default function BookCard({ book }) {
  const cover = book.coverImage || book.thumbnail;
  const inStock = (book.stock ?? 0) > 0;

  return (
    <Link
      to={`/books/${book.id || book._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-shadow hover:shadow-lg"
    >
      <div className="relative flex aspect-[2/3] items-center justify-center overflow-hidden bg-ink-50">
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="text-4xl text-ink-300">📚</span>
        )}
        {typeof book.averageRating === "number" && book.averageRating > 0 && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-amber-600 shadow-sm">
            <FaStar className="h-3 w-3" />
            {book.averageRating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-ink-900 group-hover:text-brand-700">
          {book.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-ink-500">
          {book.authors?.join(", ") || "Unknown author"}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-base font-bold text-ink-900">{formatCurrency(book.price)}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
      </div>
    </Link>
  );
}
