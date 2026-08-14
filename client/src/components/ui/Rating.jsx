/**
 * components/ui/Rating.jsx — star rating display + interactive input.
 * `value` is 0–5; `onChange` makes it an input (read-only otherwise).
 */
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

function Star({ type, className }) {
  const Icon = type === "full" ? FaStar : type === "half" ? FaStarHalfAlt : FaRegStar;
  return <Icon className={className} />;
}

function starType(index, value) {
  if (value >= index + 1) return "full";
  if (value > index && value < index + 1) return "half";
  return "empty";
}

export default function Rating({ value = 0, onChange, size = "text-sm", count }) {
  const interactive = typeof onChange === "function";

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex items-center gap-0.5 ${size} text-amber-400`}
        role="img"
        aria-label={`Rated ${value} out of 5`}
      >
        {[0, 1, 2, 3, 4].map((i) =>
          interactive ? (
            <button
              key={i}
              type="button"
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => onChange(i + 1)}
              aria-label={`Rate ${i + 1} star${i + 1 > 1 ? "s" : ""}`}
            >
              <Star type={starType(i, value)} className={size} />
            </button>
          ) : (
            <Star key={i} type={starType(i, value)} className={size} />
          )
        )}
      </div>
      {typeof count === "number" && (
        <span className="text-xs text-ink-500">
          {value.toFixed(1)} ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
