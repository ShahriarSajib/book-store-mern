/**
 * pages/public/AuthorPage.jsx — author detail with their books,
 * driven by /api/authors/:id and /api/books?author=.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import catalogApi from "../../services/catalogApi";
import bookApi from "../../services/bookApi";
import BookGrid from "../../components/books/BookGrid";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";

const PAGE_SIZE = 12;

export default function AuthorPage() {
  const { id } = useParams();
  const [page, setPage] = useState(1);

  const authorQuery = useQuery({
    queryKey: ["author", id],
    queryFn: () => catalogApi.authors.get(id),
  });

  const booksQuery = useQuery({
    queryKey: ["author-books", id, page],
    queryFn: () =>
      bookApi.list({
        author: authorQuery.data?.item?.name,
        page,
        limit: PAGE_SIZE,
      }),
    enabled: !!authorQuery.data?.item,
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [id]);

  const item = authorQuery.data?.item;
  const bookCount = authorQuery.data?.bookCount;
  const books = booksQuery.data?.books || [];
  const pagination = booksQuery.data?.pagination || { page: 1, pages: 1 };

  const meta = [
    item.country,
    item.bornYear ? `Born ${item.bornYear}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  if (authorQuery.isLoading) {
    return (
      <div className="flex justify-center py-24 text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (authorQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="font-medium text-red-700">Failed to load this author</p>
        <p className="text-sm text-red-600">
          {authorQuery.error?.response?.data?.error?.message || authorQuery.error.message}
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
        <div className="flex items-center gap-4">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-20 w-20 rounded-full border border-ink-100 object-cover shadow-soft"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <FaUser className="h-8 w-8" />
            </span>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-ink-900">{item.name}</h1>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
                {bookCount} {bookCount === 1 ? "book" : "books"}
              </span>
            </div>
            {meta && <p className="mt-1 text-sm text-ink-500">{meta}</p>}
          </div>
        </div>
        {item.bio && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-600">{item.bio}</p>
        )}
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
            emptyTitle="No books by this author"
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
