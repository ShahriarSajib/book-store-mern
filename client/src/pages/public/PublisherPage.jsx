/**
 * pages/public/PublisherPage.jsx — publisher detail with their books,
 * driven by /api/publishers/:id and /api/books?publisher=.
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft, FaBookOpen, FaGlobe } from "react-icons/fa";
import catalogApi from "../../services/catalogApi";
import bookApi from "../../services/bookApi";
import BookGrid from "../../components/books/BookGrid";
import Pagination from "../../components/ui/Pagination";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

const PAGE_SIZE = 12;

export default function PublisherPage() {
  const { id } = useParams();
  const [page, setPage] = useState(1);

  const publisherQuery = useQuery({
    queryKey: ["publisher", id],
    queryFn: () => catalogApi.publishers.get(id),
  });

  const booksQuery = useQuery({
    queryKey: ["publisher-books", id, page],
    queryFn: () =>
      bookApi.list({
        publisher: publisherQuery.data?.item?.name,
        page,
        limit: PAGE_SIZE,
      }),
    enabled: !!publisherQuery.data?.item,
    keepPreviousData: true,
  });

  useEffect(() => {
    setPage(1);
  }, [id]);

  const item = publisherQuery.data?.item;
  const bookCount = publisherQuery.data?.bookCount;
  const books = booksQuery.data?.books || [];
  const pagination = booksQuery.data?.pagination || { page: 1, pages: 1 };

  if (publisherQuery.isLoading) {
    return (
      <div className="flex justify-center py-24 text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (publisherQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="font-medium text-red-700">Failed to load this publisher</p>
        <p className="text-sm text-red-600">
          {publisherQuery.error?.response?.data?.error?.message || publisherQuery.error.message}
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
        {(item.country || item.website) && (
          <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            {item.country && <span>{item.country}</span>}
            {item.website && (
              <a
                href={item.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline"
              >
                <FaGlobe className="h-3.5 w-3.5" />
                {item.website}
              </a>
            )}
          </p>
        )}
        {item.description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{item.description}</p>
        )}
      </header>

      {bookCount === 0 ? (
        <EmptyState
          icon={FaBookOpen}
          title="No books from this publisher yet"
          description="Check back soon or browse the full catalog."
        />
      ) : booksQuery.isError ? (
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
            emptyTitle="No books from this publisher"
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
