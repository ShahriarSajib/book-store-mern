/**
 * components/reviews/ReviewList.jsx — list of reviews for a book.
 * Accepts optional currentUserId to show edit/delete on own reviews.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import reviewApi from "../../services/reviewApi";
import Rating from "../../components/ui/Rating";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ReviewForm from "./ReviewForm";
import { formatDate } from "../../utils/format";
import { FaCommentDots, FaPen, FaTrash } from "react-icons/fa";

export default function ReviewList({ bookId, currentUserId }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => reviewApi.forBook(bookId),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId) => reviewApi.remove(reviewId),
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || "Could not delete review"),
  });

  const handleDelete = (reviewId) => {
    if (window.confirm("Delete this review? This cannot be undone.")) {
      deleteMutation.mutate(reviewId);
    }
  };

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
          {reviews.map((review) => {
            const reviewId = review._id || review.id;
            const isOwner = currentUserId && review.user?._id === currentUserId;
            const isEditing = editingId === reviewId;

            if (isEditing) {
              return (
                <div key={reviewId} className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
                  <ReviewForm
                    bookId={bookId}
                    review={review}
                    onSuccess={() => {
                      setEditingId(null);
                      queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              );
            }

            return (
              <article
                key={reviewId}
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
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingId(reviewId)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-600"
                          aria-label="Edit review"
                        >
                          <FaPen /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(reviewId)}
                          disabled={deleteMutation.isLoading}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete review"
                        >
                          <FaTrash /> Delete
                        </button>
                      </>
                    )}
                    <span className="text-xs text-ink-500">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                {review.title && <h4 className="mt-3 font-semibold text-ink-900">{review.title}</h4>}
                {review.body && <p className="mt-1 text-sm leading-relaxed text-ink-700">{review.body}</p>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
