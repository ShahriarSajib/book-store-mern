/**
 * pages/auth/AuthShell.jsx — shared layout for all auth pages.
 * Design: split-screen on lg+ (branded left panel + form right), stacked on mobile.
 * Renders the form card inside a glass container with subtle entrance animation.
 */
import { Link } from "react-router-dom";
import { FaBook, FaQuoteLeft, FaShieldAlt, FaStar } from "react-icons/fa";

const testimonials = [
  {
    quote: "The semantic search feels like magic — I discover books I never would have found.",
    author: "Aisha K.",
    role: "Verified customer",
  },
  {
    quote: "Checkout is fast, the chatbot help is genuinely useful, and reviews are real.",
    author: "Rohan M.",
    role: "Verified customer",
  },
  {
    quote: "Best place to manage my collection. Personalized picks are spot on.",
    author: "Sara L.",
    role: "Verified customer",
  },
];

export default function AuthShell({ title, subtitle, footer, children }) {
  const testimonial = testimonials[Math.floor(Math.random() * testimonials.length)];

  return (
    <div className="auth-shell">
      {/* Decorative blurred orbs (purely cosmetic) */}
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />
      <div className="auth-orb auth-orb-3" aria-hidden />

      <div className="auth-grid">
        {/* Brand side — hidden on small screens */}
        <aside className="auth-brand">
          <Link to="/" className="auth-brand__logo">
            <span className="auth-brand__logo-mark">
              <FaBook />
            </span>
            <span className="auth-brand__logo-text">AI Bookstore</span>
          </Link>

          <div className="auth-brand__hero">
            <h1 className="auth-brand__title">
              Discover <span className="auth-brand__title-grad">books you&apos;ll love</span>
            </h1>
            <p className="auth-brand__subtitle">
              Personalized recommendations. Real reviews. A smarter way to read.
            </p>
          </div>

          <blockquote className="auth-brand__quote">
            <FaQuoteLeft className="auth-brand__quote-icon" aria-hidden />
            <p>{testimonial.quote}</p>
            <footer className="auth-brand__quote-meta">
              <span className="auth-brand__quote-author">{testimonial.author}</span>
              <span className="auth-brand__quote-sep">·</span>
              <span className="auth-brand__quote-role">{testimonial.role}</span>
            </footer>
          </blockquote>

          <ul className="auth-brand__features">
            <li>
              <FaStar className="auth-brand__feature-icon" /> Semantic search &amp; recommendations
            </li>
            <li>
              <FaShieldAlt className="auth-brand__feature-icon" /> Secure checkout &amp; protected data
            </li>
          </ul>
        </aside>

        {/* Form side */}
        <section className="auth-form-wrap">
          <div className="auth-card" role="region" aria-labelledby="auth-card-title">
            <header className="auth-card__header">
              <h2 id="auth-card-title" className="auth-card__title">
                {title}
              </h2>
              {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
            </header>

            <div className="auth-card__body">{children}</div>

            {footer && <div className="auth-card__footer">{footer}</div>}
          </div>

          <p className="auth-footer-text">
            <Link to="/" className="auth-footer-link">
              ← Back to bookstore
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
