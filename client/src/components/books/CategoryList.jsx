/**
 * components/books/CategoryList.jsx — horizontal category chips from facets.
 */
import cn from "../../utils/cn";

export default function CategoryList({ categories = [], active, onSelect }) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect("")}
        className={cn(
          "chip transition-colors",
          !active ? "border-brand-500 bg-brand-50 text-brand-700" : "hover:border-brand-300"
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.name}
          type="button"
          onClick={() => onSelect(cat.name)}
          className={cn(
            "chip transition-colors",
            active === cat.name
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "hover:border-brand-300"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
