/**
 * components/recommendations/PersonalizedForYou.jsx
 * Section 3 — ✨ Recommended For You.
 * "What is good for me?"
 * Visual identity: emerald/teal gradient — the "for me" feel.
 *
 * Data flow: GET /api/recommendations/personalized (auth required)
 */
import { Link } from "react-router-dom";
import { FaUserCheck, FaUserPlus } from "react-icons/fa";
import { usePersonalized } from "../../hooks/useRecommendations";
import useAuth from "../../hooks/useAuth";
import PersonalizedBookCard from "./PersonalizedBookCard";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

export default function PersonalizedForYou() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, isError, error } = usePersonalized({
    limit: 8,
    enabled: !authLoading && isAuthenticated,
  });

  // Not signed in — friendly sign-in CTA, no error, no skeleton.
  if (!authLoading && !isAuthenticated) {
    return (
      <section className="rec rec--personalized rec--signed-out" aria-labelledby="personalized-heading">
        <header className="rec__header">
          <span className="rec__icon rec__icon--personalized" aria-hidden>
            <FaUserCheck />
          </span>
          <div>
            <p className="rec__eyebrow">What is good for me?</p>
            <h2 id="personalized-heading" className="rec__title">
              ✨ Recommended For You
            </h2>
            <p className="rec__subtitle">
              Personalized book recommendations based on your interests and activity.
            </p>
          </div>
        </header>
        <div className="rec__body">
          <div className="rec__signin">
            <p>
              Sign in and we’ll tune picks to your interests, ratings, and reading activity.
            </p>
            <div className="mt-4 flex gap-2">
              <Link to="/login" className="rec__btn rec__btn--solid">
                Log in
              </Link>
              <Link to="/register" className="rec__btn rec__btn--outline">
                <FaUserPlus /> Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const items = Array.isArray(data)
    ? data
    : data?.results || data?.books || data?.recommendations || [];

  return (
    <section className="rec rec--personalized" aria-labelledby="personalized-heading">
      <header className="rec__header">
        <span className="rec__icon rec__icon--personalized" aria-hidden>
          <FaUserCheck />
        </span>
        <div>
          <p className="rec__eyebrow">What is good for me?</p>
          <h2 id="personalized-heading" className="rec__title">
            ✨ Recommended For You
          </h2>
          <p className="rec__subtitle">
            Personalized book recommendations based on your interests and activity.
          </p>
        </div>
      </header>

      <div className="rec__body">
        {isLoading && (
          <div className="rec__state rec__state--loading" role="status">
            <Spinner className="h-5 w-5" />
            <span>Tuning picks to your taste…</span>
          </div>
        )}

        {isError && (
          <div className="rec__state rec__state--error" role="alert">
            <p className="font-medium">Couldn’t load your recommendations</p>
            <p className="text-xs">
              {error?.response?.data?.error?.message ||
                error?.message ||
                "Something went wrong."}
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <EmptyState
            icon={FaUserCheck}
            title="Your feed is warming up"
            description="Browse a few books and rate them — your picks will get sharper."
          />
        )}

        {!isLoading && items.length > 0 && (
          <div className="personalized-grid">
            {items.slice(0, 8).map((book) => (
              <PersonalizedBookCard
                key={book.id || book._id || book.title}
                book={book}
                matchReason={book.matchReason || book.reason}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}