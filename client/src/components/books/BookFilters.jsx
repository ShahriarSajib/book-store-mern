/**
 * components/books/BookFilters.jsx — category/author/in-stock filters driven
 * by the facets returned from the catalog API.
 */
import { FaTimes } from "react-icons/fa";
import Button from "../ui/Button";

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.name} value={opt.name}>
            {opt.name} ({opt.count})
          </option>
        ))}
      </select>
    </label>
  );
}

export default function BookFilters({ facets = {}, category, author, inStock, onChange }) {
  const hasFilters = Boolean(category || author || inStock);

  const update = (patch) => onChange({ category, author, inStock, ...patch });

  const clear = () => onChange({ category: "", author: "", inStock: "" });

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
          >
            <FaTimes className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Select
          label="Category"
          value={category}
          onChange={(v) => update({ category: v })}
          options={facets.categories || []}
        />
        <Select
          label="Author"
          value={author}
          onChange={(v) => update({ author: v })}
          options={facets.authors || []}
        />

        <label className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-700">In stock only</span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(inStock)}
            onClick={() => update({ inStock: inStock ? "" : "true" })}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              inStock ? "bg-brand-600" : "bg-ink-200"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                inStock ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>

        <Button variant="outline" size="sm" fullWidth onClick={clear}>
          Reset
        </Button>
      </div>
    </div>
  );
}
