/**
 * components/ai/SemanticSearchFilter — Category & price range filters.
 */
import { FaTimes, FaTag, FaDollarSign, FaSlidersH } from "react-icons/fa";

const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Biography",
  "History",
  "Science",
  "Technology",
  "Self-Help",
  "Business",
  "Children",
  "Poetry",
];

export default function SemanticSearchFilter({ filters, setFilters }) {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const hasAny = filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm dark:border-ink-700 dark:bg-ink-100">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-ink-200">
          <FaSlidersH className="text-brand-600" />
          Refine Results
        </h3>
        {hasAny && (
          <button
            type="button"
            onClick={() => setFilters({ category: "", minPrice: "", maxPrice: "" })}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 dark:text-ink-400">
            <FaTag /> Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => update("category", e.target.value)}
            className="input text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 dark:text-ink-400">
            <FaDollarSign /> Min Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
            className="input text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-ink-500 dark:text-ink-400">
            <FaDollarSign /> Max Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Any"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="input text-sm"
          />
        </div>
      </div>

      {hasAny && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {filters.category}
              <button type="button" onClick={() => update("category", "")} className="ml-0.5 hover:text-brand-900">
                <FaTimes className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.minPrice && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Min ${filters.minPrice}
              <button type="button" onClick={() => update("minPrice", "")} className="ml-0.5 hover:text-brand-900">
                <FaTimes className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              Max ${filters.maxPrice}
              <button type="button" onClick={() => update("maxPrice", "")} className="ml-0.5 hover:text-brand-900">
                <FaTimes className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
