/**
 * pages/public/CategoryPage.jsx — category detail with its books,
 * driven by /api/categories/:id and /api/books?category=.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft } from "react-icons/fa";
import catalogApi from "../../services/catalogApi";
import bookApi from "../../services/bookApi";
import BookGrid from "../../components/books/BookGrid";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { id } = useParams();
  const [page, setPage] = useState(1);

  const categoryQuery = useQuery({
    queryKey: ["category", id],
    queryFn: () => catalogApi.categories.get(id),
  });

  const booksQuery = useQuery({
    queryKey: ["category-books", id, page],
    queryFn: () =>
      bookApi.list({
        category: categoryQuery.data?.item?.name,
        page,
        limit: PAGE_SIZE,
      }),
    enabled: !!categoryQuery.data?.item,
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [id]);

  const item = categoryQuery.data?.item;
  const bookCount = categoryQuery.data?.bookCount;
  const books = booksQuery.data?.books || [];
  const pagination = booksQuery.data?.pagination || { page: 1, pages: 1 };

  if (categoryQuery.isLoading) {
    return (
      <div className="flex justify-center py-24 text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (categoryQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="font-medium text-red-700">Failed to load this category</p>
        <p className="text-sm text-red-600">
          {categoryQuery.error?.response?.data?.error?.message || categoryQuery.error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
      >
        <FaArrowLeft /> Back to catalog
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-ink-900">{item.name}</h1>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            {bookCount} {bookCount === 1 ? "book" : "books"}
          </span>
        </div>
        {item.description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{item.description}</p>
        )}
        <p className="mt-1 text-sm text-ink-500">
          {pagination.total > 0
            ? `${pagination.total.toLocaleString()} books`
            : "No books in this category yet"}
        </p>
      </header>

      {booksQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-medium text-red-700">Failed to load books</p>
          <p className="text-sm text-red-600">
            {booksQuery.error?.response?.data?.error?.message || booksQuery.error.message}
          </p>
        </div>
      ) : (
        <>
          <BookGrid
            books={books}
            loading={booksQuery.isLoading}
            emptyTitle="No books in this category"
            emptyDescription="Check back soon or browse the full catalog."
          />
          {!booksQuery.isLoading && books.length > 0 && (
            <div className="mt-8">
              <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
