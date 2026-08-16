/**
 * pages/public/SearchResults.jsx — keyword search results with an optional
 * AI semantic match row on top, driven by /api/books?q= and /api/semantic-search.
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaSearch } from "react-icons/fa";
import bookApi from "../../services/bookApi";
import searchApi from "../../services/searchApi";
import BookGrid from "../../components/books/BookGrid";
import BookCard from "../../components/books/BookCard";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";

const PAGE_SIZE = 12;

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const keywordQuery = useQuery({
    queryKey: ["search", q, page],
    queryFn: () => bookApi.list({ q, page, limit: PAGE_SIZE }),
    enabled: q.length > 0,
    keepPreviousData: true,
  });

  const semanticQuery = useQuery({
    queryKey: ["semantic-search", q],
    queryFn: async () => {
      try {
        return await searchApi.semantic({ q, limit: 5 });
      } catch (_error) {
        return null;
      }
    },
    enabled: q.length > 0,
  });

  if (!q) {
    return (
      <div className="flex justify-center py-16">
        <EmptyState
          icon={FaSearch}
          title="Search the catalog"
          description="Enter a query to search for books by title, author, or topic."
        />
      </div>
    );
  }

  const books = keywordQuery.data?.books || [];
  const pagination = keywordQuery.data?.pagination || { page: 1, pages: 1 };
  const aiBooks = (semanticQuery.data?.results || semanticQuery.data?.books || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-ink-900">Results for &quot;{q}&quot;</h1>
        <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-500">
          {keywordQuery.data?.pagination?.total > 0
            ? `${keywordQuery.data.pagination.total.toLocaleString()} books`
            : "Searching our catalog"}
          <Link
            to={`/ai-search?q=${encodeURIComponent(q)}`}
            className="font-medium text-brand-600 hover:underline"
          >
            Try AI semantic search
          </Link>
        </p>
      </header>

      {aiBooks.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-ink-900">AI matches</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {aiBooks.map((book) => (
              <BookCard key={book.id || book._id} book={book} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Keyword results</h2>
        {keywordQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-700">Failed to load results</p>
            <p className="text-sm text-red-600">
              {keywordQuery.error?.response?.data?.error?.message || keywordQuery.error.message}
            </p>
          </div>
        ) : (
          <>
            <BookGrid
              books={books}
              loading={keywordQuery.isLoading}
              emptyTitle="No books found"
              emptyDescription={`No books matched "${q}". Try different keywords or use AI semantic search.`}
            />
            {!keywordQuery.isLoading && books.length > 0 && (
              <div className="mt-8">
                <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
