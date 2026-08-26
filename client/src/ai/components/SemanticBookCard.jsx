/**
 * components/ai/SemanticBookCard — Single book result card with similarity score.
 */
import { Link } from "react-router-dom";
import { FaBook, FaStar } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

export default function SemanticBookCard({ book }) {
  const id = book._id || book.id;
  const similarity = book.similarity != null ? (book.similarity * 100).toFixed(1) : null;

  return (
    <Link
      to={`/books/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-ink-700 dark:bg-ink-100"
    >
      <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50 dark:from-ink-200 dark:to-ink-200">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <FaBook className="h-16 w-16 text-ink-300 dark:text-ink-500" />
        )}

        {similarity != null && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-600/95 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            {similarity}% match
          </span>
        )}

        {book.stock !== undefined && book.stock <= 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-500/95 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-ink-900 group-hover:text-brand-700 dark:text-ink-50">
          {book.title}
        </h3>

        {book.authors?.length > 0 && (
          <p className="mt-1 line-clamp-1 text-xs text-ink-500 dark:text-ink-400">
            by {book.authors.join(", ")}
          </p>
        )}

        {book.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
            {book.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-extrabold text-accent-700 dark:text-accent-400">
            {book.price != null ? formatCurrency(book.price) : "—"}
          </span>
          {book.averageRating != null && book.averageRating > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <FaStar className="h-3 w-3" />
              {book.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {book.categories?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {book.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600 dark:bg-ink-200 dark:text-ink-400"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
