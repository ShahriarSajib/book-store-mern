/**
 * pages/customer/Wishlist.jsx — saved books grid.
 */
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import wishlistApi from "../../services/wishlistApi";
import BookCard from "../../components/books/BookCard";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { FaHeart } from "react-icons/fa";

export default function Wishlist() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.get,
    keepPreviousData: true,
  });

  const removeMutation = useMutation({
    mutationFn: (bookId) => wishlistApi.remove(bookId),
    onSuccess: () => {
      toast.success("Removed from wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || "Could not remove book"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="font-medium text-red-700">Failed to load your wishlist</p>
        <p className="text-sm text-red-600">{error?.response?.data?.error?.message || error?.message}</p>
      </div>
    );
  }

  const items = data?.wishlist?.items || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          My wishlist ({items.length} book{items.length === 1 ? "" : "s"})
        </h1>
        <p className="text-sm text-ink-500">Books you have saved for later.</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={FaHeart}
          title="No saved books"
          description="Tap the heart on any book to keep it here."
          actionLabel="Browse books"
          onAction={() => navigate("/books")}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => {
            const book = item.book || {};
            const bookId = book._id || book.id;
            return (
              <div key={item._id || bookId} className="relative">
                <BookCard book={book} />
                <button
                  type="button"
                  onClick={() => {
                    if (!bookId) {
                      toast.error("This book cannot be removed");
                      return;
                    }
                    removeMutation.mutate(bookId);
                  }}
                  className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${book.title} from wishlist`}
                >
                  <FaHeart />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
