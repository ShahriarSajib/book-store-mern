/**
 * components/books/BookSort.jsx — sort dropdown for the catalog.
 */
const OPTIONS = [
  { value: "", label: "Sort by" },
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Top rated" },
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "title", label: "Title A–Z" },
];

export default function BookSort({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort books"
      className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
