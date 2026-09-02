/**
 * components/ui/Pagination.jsx — prev/next + numbered page controls.
 */
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import cn from "../../utils/cn";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const siblings = 1;
  const start = Math.max(1, page - siblings);
  const end = Math.min(pages, page + siblings);
  const items = [];

  if (start > 1) items.push(1);
  if (start > 2) items.push("…");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < pages - 1) items.push("…");
  if (end < pages) items.push(pages);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        className="btn btn-secondary px-2.5 py-1.5"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <FaChevronLeft className="h-3.5 w-3.5" />
      </button>
      {items.map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-ink-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              item === page
                ? "bg-brand-600 text-white"
                : "text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            )}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        className="btn btn-secondary px-2.5 py-1.5"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <FaChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
