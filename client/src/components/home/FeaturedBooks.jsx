/**
 * components/home/FeaturedBooks.jsx
 * Curated homepage carousel backed by GET /api/books.
 * Re-uses the existing book endpoint with a sort=rating query (same call
 * already used by Books.jsx) so no backend change is needed.
 */
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaExclamationTriangle,
} from "react-icons/fa";
import bookApi from "../../services/bookApi";
import HomeBookCard from "./HomeBookCard";

const ACCENTS = ["brand", "accent", "gold", "rose"];

export default function FeaturedBooks({ limit = 8 }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["home-featured-books", limit],
    queryFn: () =>
      bookApi
        .list({ sort: "-rating", limit, page: 1 })
        .then((res) => res?.books || res?.items || res || []),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="section" aria-labelledby="lp-featured-title">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
            Hand-picked for you
          </p>
          <h2
            id="lp-featured-title"
            className="mt-1 text-2xl font-extrabold text-ink-900 sm:text-3xl"
          >
            Featured books
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-700 sm:text-base">
            Top-rated titles across every genre — refreshed from the catalog.
          </p>
        </div>
        <Link
          to="/books"
          className="hidden text-sm font-semibold text-brand-700 hover:text-brand-800 sm:inline-flex sm:items-center sm:gap-1"
        >
          Browse all books <FaArrowRight className="text-xs" />
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-ink-100 bg-ivory"
            >
              <div className="skel aspect-[2/3]" />
              <div className="space-y-2 p-4">
                <div className="skel h-3 w-3/4" />
                <div className="skel h-3 w-1/2" />
                <div className="skel h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FaExclamationTriangle />
          <span>
            {error?.response?.data?.error?.message ||
              error?.message ||
              "Couldn’t load featured books right now."}
          </span>
        </div>
      )}

      {!isLoading && !isError && Array.isArray(data) && data.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.slice(0, limit).map((book, i) => (
            <HomeBookCard
              key={book.id || book._id || book.title}
              book={book}
              accent={ACCENTS[i % ACCENTS.length]}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-ivory p-6 text-sm text-ink-700">
          <FaBookOpen />
          <span>No featured books yet — check back soon.</span>
        </div>
      )}
    </section>
  );
}