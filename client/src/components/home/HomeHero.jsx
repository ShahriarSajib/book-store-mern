/**
 * components/home/HomeHero.jsx
 * Premium hero — headline, supporting copy, primary CTAs, social proof, and
 * an animated decorative book stack on the right.
 * Auth state is the only external dependency (passed in via props).
 */
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaBrain,
  FaSignInAlt,
  FaMagic,
  FaStar,
  FaUserPlus,
} from "react-icons/fa";
import Button from "../ui/Button";

export default function HomeHero({ isAuthenticated, isAdmin, user, isAuthLoading }) {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <span className="lp-hero__blob" aria-hidden />
      <div className="lp-hero__inner">
        <div>
          <span className="lp-hero__eyebrow">
            <FaMagic className="text-accent-600" /> New: AI-curated weekly picks
          </span>
          <h1 id="lp-hero-title" className="lp-hero__title">
            The AI-powered <span className="lp-hero__title-grad">bookstore</span>
            <br />
            for curious readers.
          </h1>
          <p className="lp-hero__sub">
            Discover books you&apos;ll love with semantic search, real reviews, and
            personalized recommendations tuned to your taste.
          </p>

          <div className="lp-hero__ctas">
            {!isAuthLoading && isAuthenticated ? (
              <>
                <Link to={isAdmin ? "/admin" : "/profile"}>
                  <Button
                    size="lg"
                    className="!bg-ink-900 !text-ivory hover:!bg-ink-800 shadow-lg"
                  >
                    {isAdmin ? "Open admin panel" : "Go to my profile"}{" "}
                    <FaArrowRight />
                  </Button>
                </Link>
                <Link to="/books">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="!text-ink-900 hover:!bg-sand border border-ink-200"
                  >
                    <FaBookOpen /> Browse books
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="!bg-ink-900 !text-ivory hover:!bg-ink-800 shadow-lg"
                  >
                    <FaUserPlus /> Create free account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="!text-ink-900 hover:!bg-sand border border-ink-200"
                  >
                    <FaSignInAlt /> Log in
                  </Button>
                </Link>
              </>
            )}
          </div>

          <ul className="lp-hero__trust">
            <li className="lp-hero__trust-item">
              <FaStar className="text-accent-600" /> 4.8 from 12k+ readers
            </li>
            <li className="lp-hero__trust-item">
              <span className="lp-hero__trust-dot" /> Free shipping over $35
            </li>
            <li className="lp-hero__trust-item">
              <span className="lp-hero__trust-dot" /> 30-day easy returns
            </li>
          </ul>

          {!isAuthLoading && isAuthenticated && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-ivory/80 px-3 py-1.5 text-sm text-ink-700 backdrop-blur">
              Welcome back,{" "}
              <span className="font-semibold text-ink-900">{user?.name?.split(" ")[0]}</span>
              <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-700">
                {user?.role}
              </span>
              <FaBrain className="text-accent-600" />
              <span>Your feed is ready below.</span>
            </p>
          )}
        </div>

        {/* Decorative visual */}
        <div className="lp-hero__visual" aria-hidden>
          <div className="lp-hero__book lp-hero__book--1">
            <div className="lp-hero__book-cover">
              <span className="lp-hero__book-spine" />
            </div>
            <div className="lp-hero__book-label">Discovery</div>
          </div>
          <div className="lp-hero__book lp-hero__book--2">
            <div className="lp-hero__book-cover">
              <span className="lp-hero__book-spine" />
            </div>
            <div className="lp-hero__book-label">Featured</div>
          </div>
          <div className="lp-hero__book lp-hero__book--3">
            <div className="lp-hero__book-cover">
              <span className="lp-hero__book-spine" />
            </div>
            <div className="lp-hero__book-label">For You</div>
          </div>
        </div>
      </div>
    </section>
  );
}
