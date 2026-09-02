/**
 * components/cart/CartItem.jsx — single line in the cart.
 */
import { Link } from "react-router-dom";
import { FaBookOpen, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/format";

export default function CartItem({ item, onUpdate, onRemove, disabled }) {
  const qty = Number(item.quantity) || 1;
  const price = Number(item.price) || 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      <Link
        to={`/books/${item.bookId}`}
        className="flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50"
      >
        {item.coverImage ? (
          <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <FaBookOpen className="text-ink-300" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={`/books/${item.bookId}`}
          className="block truncate font-semibold text-ink-900 hover:text-brand-700"
        >
          {item.title}
        </Link>
        {item.authors?.length > 0 && (
          <p className="truncate text-xs text-ink-500">{item.authors.join(", ")}</p>
        )}
        <p className="mt-1 text-sm font-medium text-ink-700">{formatCurrency(price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdate?.(Math.max(1, qty - 1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          <FaMinus />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-ink-900">{qty}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUpdate?.(qty + 1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Increase quantity"
        >
          <FaPlus />
        </button>
      </div>

      <div className="w-24 text-right">
        <p className="text-sm font-bold text-ink-900">{formatCurrency(price * qty)}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${item.title}`}
        className="text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <FaTrash />
      </Button>
    </div>
  );
}
