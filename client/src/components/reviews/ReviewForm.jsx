/**
 * components/reviews/ReviewForm.jsx — create or edit a review for a book.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import reviewApi from "../../services/reviewApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import RatingStars from "./RatingStars";

export default function ReviewForm({ bookId, review = null, onSuccess, onCancel }) {
  const editing = Boolean(review);
  const [rating, setRating] = useState(review?.rating || 5);
  const [title, setTitle] = useState(review?.title || "");
  const [body, setBody] = useState(review?.body || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }
    setSubmitting(true);
    try {
      const payload = { rating, title: title.trim(), body: body.trim() };
      if (editing) {
        await reviewApi.update(review._id || review.id, payload);
        toast.success("Review updated");
      } else {
        await reviewApi.create({ book: bookId, ...payload });
        toast.success("Thanks for your review");
      }
      setRating(5);
      setTitle("");
      setBody("");
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Could not save your review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700">Your rating</span>
        <RatingStars value={rating} onChange={setRating} size="text-xl" />
      </div>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A short headline" />
      <Input
        label="Review"
        textarea
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts about this book…"
      />
      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting}>
          {editing ? "Save changes" : "Submit review"}
        </Button>
        {editing && onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
