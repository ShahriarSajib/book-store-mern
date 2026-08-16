/**
 * pages/admin/Reviews.jsx — moderate reviews.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import adminApi from "../../services/adminApi";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Rating from "../../components/ui/Rating";
import { FaTrash } from "react-icons/fa";
import { formatDate } from "../../utils/format";

const getId = (item) => item?._id || item?.id;

export default function Reviews() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => adminApi.reviews.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => adminApi.reviews.update(id, patch),
    onSuccess: () => {
      toast.success("Review updated");
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || err?.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.reviews.remove(id),
    onSuccess: () => {
      toast.success("Review deleted");
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || err?.message || "Delete failed"),
  });

  const handleDelete = (review) => {
    if (window.confirm("Delete this review? This cannot be undone.")) {
      deleteMutation.mutate(getId(review));
    }
  };

  const reviews = data?.reviews || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Review moderation</h1>
        <p className="text-sm text-slate-500">Approve, edit or remove customer reviews.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600">
          <Spinner className="h-8 w-8" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No reviews yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Reviewer</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3">Approved</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={getId(review)} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50">
                        {review.book?.coverImage ? (
                          <img
                            src={review.book.coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </div>
                      <p className="max-w-[180px] truncate font-medium text-slate-800">
                        {review.book?.title || "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{review.user?.name || "—"}</p>
                    <p className="max-w-[160px] truncate text-xs text-slate-500">
                      {review.user?.email || ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Rating value={review.rating} size="text-xs" />
                  </td>
                  <td className="max-w-[280px] px-4 py-3">
                    <p className="truncate font-medium text-slate-700">{review.title || "—"}</p>
                    <p className="truncate text-xs text-slate-500">{review.body || ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant={review.isApproved ? "secondary" : "primary"}
                      size="sm"
                      loading={
                        updateMutation.isLoading &&
                        updateMutation.variables?.id === getId(review)
                      }
                      onClick={() =>
                        updateMutation.mutate({
                          id: getId(review),
                          patch: { isApproved: !review.isApproved },
                        })
                      }
                    >
                      {review.isApproved ? "Unapprove" : "Approve"}
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(review.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={
                          deleteMutation.isLoading &&
                          deleteMutation.variables === getId(review)
                        }
                        onClick={() => handleDelete(review)}
                        aria-label="Delete review"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
