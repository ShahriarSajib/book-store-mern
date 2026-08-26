/**
 * components/ai/SemanticSearchResults — Grid of AI-matched book cards.
 */
import SemanticBookCard from "./SemanticBookCard";

export default function SemanticSearchResults({ results }) {
  if (!results.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500 dark:text-ink-400">
          <strong className="text-ink-900 dark:text-ink-50">{results.length}</strong> match
          {results.length === 1 ? "" : "es"} found
        </p>
        <div className="text-xs text-ink-400 dark:text-ink-500">
          Sorted by relevance
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((book) => (
          <SemanticBookCard key={book._id || book.id || book.title} book={book} />
        ))}
      </div>
    </div>
  );
}
