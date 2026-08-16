/**
 * components/reviews/RatingStars.jsx — interactive 1–5 star picker.
 */
import { FaStar } from "react-icons/fa";

export default function RatingStars({ value = 0, onChange, size = "text-lg", readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];

  if (readOnly || typeof onChange !== "function") {
    return (
      <div className={`flex items-center gap-1 ${size}`} aria-label={`${value} out of 5 stars`}>
        {stars.map((star) => (
          <FaStar key={star} className={star <= value ? "text-amber-400" : "text-ink-200"} />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          aria-pressed={value === star}
        >
          <FaStar className={star <= value ? "text-amber-400" : "text-ink-200"} />
        </button>
      ))}
    </div>
  );
}
