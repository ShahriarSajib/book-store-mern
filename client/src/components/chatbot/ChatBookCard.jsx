/**
 * components/chatbot/ChatBookCard.jsx — compact book card rendered in chat replies.
 */
import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

export default function ChatBookCard({ book }) {
  const bookId = book.id || book._id;
  const inStock = (book.stock ?? 0) > 0;

  return (
    <Link
      to={`/books/${bookId}`}
      className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-2 transition hover:border-brand-300 hover:shadow-soft"
    >
      <span className="flex w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-100 text-ink-300">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="aspect-[2/3] w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <FaBookOpen className="h-6 w-6" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-medium text-ink-800">{book.title}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-400">
          {book.authors?.join(", ") || "Unknown author"}
        </span>
        <span className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">{formatCurrency(book.price)}</span>
          {!inStock && <span className="text-xs font-medium text-red-500">Out of stock</span>}
        </span>
      </span>
    </Link>
  );
}
