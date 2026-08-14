/**
 * pages/public/Books.jsx — public book catalog with search, filters, sort,
 * and pagination, driven by the /api/books endpoint.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import bookApi from "../../services/bookApi";
import SearchBar from "../../components/books/SearchBar";
import BookSort from "../../components/books/BookSort";
import BookFilters from "../../components/books/BookFilters";
import CategoryList from "../../components/books/CategoryList";
import BookGrid from "../../components/books/BookGrid";
import Pagination from "../../components/ui/Pagination";

const PAGE_SIZE = 20;

function parseParams(params) {
  return {
    page: Math.max(parseInt(params.get("page"), 10) || 1, 1),
    q: params.get("q") || "",
    category: params.get("category") || "",
    author: params.get("author") || "",
    inStock: params.get("inStock") || "",
    sort: params.get("sort") || "",
  };
}

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseParams(searchParams);
  const [query, setQuery] = useState(filters.q);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries({ ...filters, ...patch }).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (patch.q !== undefined || patch.category !== undefined || patch.author !== undefined || patch.inStock !== undefined) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  useEffect(() => {
    setQuery(filters.q);
  }, [filters.q]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["books", filters],
    queryFn: () =>
      bookApi.list({
        page: filters.page,
        limit: PAGE_SIZE,
        q: filters.q || undefined,
        category: filters.category || undefined,
        author: filters.author || undefined,
        inStock: filters.inStock || undefined,
        sort: filters.sort || undefined,
      }),
    keepPreviousData: true,
  });

  const books = data?.books || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };
  const facets = data?.facets || { categories: [], authors: [] };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-ink-900">Book catalog</h1>
        <p className="mt-1 text-sm text-ink-500">
          {pagination.total > 0
            ? `${pagination.total.toLocaleString()} books`
            : "Browse our collection"}
        </p>
      </header>

      <SearchBar value={query} onChange={(q) => updateParams({ q })} />

      <CategoryList
        categories={facets.categories}
        active={filters.category}
        onSelect={(category) => updateParams({ category })}
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="lg:sticky lg:top-24">
            <BookFilters
              facets={facets}
              category={filters.category}
              author={filters.author}
              inStock={filters.inStock}
              onChange={(patch) => updateParams(patch)}
            />
          </div>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-500">
              {isFetching ? "Updating…" : `Showing ${books.length} of ${pagination.total}`}
            </p>
            <BookSort value={filters.sort} onChange={(sort) => updateParams({ sort })} />
          </div>

          {isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-medium text-red-700">Failed to load books</p>
              <p className="text-sm text-red-600">{error?.message}</p>
              <button className="mt-3 text-sm font-medium text-red-700 underline" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : (
            <>
              <BookGrid
                books={books}
                loading={isLoading}
                emptyTitle="No books found"
                emptyDescription="Try adjusting your search or filters."
              />
              {!isLoading && books.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    page={pagination.page}
                    pages={pagination.pages}
                    onChange={(page) => updateParams({ page })}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
