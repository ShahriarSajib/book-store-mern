/**
 * components/home/CategoryShowcase.jsx
 * Top-level category navigation, sourced from the same
 * GET /api/categories call used elsewhere.
 */
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

export default function CategoryShowcase({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <section className="section" aria-labelledby="lp-cats-title">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900">
            Browse by category
          </p>
          <h2
            id="lp-cats-title"
            className="mt-1 text-2xl font-extrabold text-ink-900 sm:text-3xl"
          >
            Popular categories
          </h2>
        </div>
        <Link
          to="/books"
          className="hidden text-sm font-semibold text-brand-700 hover:text-brand-800 sm:inline-flex sm:items-center sm:gap-1"
        >
          See all <FaArrowRight className="text-xs" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 8).map((c) => (
          <Link
            key={c.name}
            to={`/books?category=${encodeURIComponent(c.name)}`}
            className="lp-cat"
          >
            <p className="lp-cat__name">{c.name}</p>
            <p className="lp-cat__count">
              {c.count != null ? `${c.count} titles` : "Explore now"}
            </p>
            <FaArrowRight className="lp-cat__arrow" />
          </Link>
        ))}
      </div>
    </section>
  );
}