/**
 * components/reviews/ReviewList.jsx — list of reviews for a book.
 */
import { useQuery } from "@tanstack/react-query";
import reviewApi from "../../services/reviewApi";
import Rating from "../../components/ui/Rating";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/format";
import { FaCommentDots } from "react-icons/fa";

export default function ReviewList({ bookId }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => reviewApi.forBook(bookId),
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12 text-brand-600">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">Failed to load reviews</p>
        <p className="text-sm text-red-600">{error?.response?.data?.error?.message || error?.message}</p>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const total = data?.pagination?.total ?? reviews.length;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-ink-900">
        Reviews ({total})
      </h3>

      {reviews.length === 0 ? (
        <EmptyState
          icon={FaCommentDots}
          title="No reviews yet"
          description="Be the first to share your thoughts about this book."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review._id || review.id}
              className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                    {(review.user?.name || "A").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {review.user?.name || "Anonymous"}
                    </p>
                    <Rating value={review.rating} size="text-xs" />
                  </div>
                </div>
                <span className="text-xs text-ink-500">{formatDate(review.createdAt)}</span>
              </div>
              {review.title && <h4 className="mt-3 font-semibold text-ink-900">{review.title}</h4>}
              {review.body && <p className="mt-1 text-sm leading-relaxed text-ink-700">{review.body}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
