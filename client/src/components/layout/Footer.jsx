/**
 * components/layout/Footer.jsx — multi-column modern footer with newsletter.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBook,
  FaFacebookF,
  FaInstagram,
  FaShieldAlt,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import Button from "../ui/Button";

export default function Footer() {
  const { isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    // Frontend-only placeholder; wire to a real endpoint later.
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Subscribed! Check your inbox for a welcome.");
    setEmail("");
    setSubmitting(false);
  };

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="flex items-center gap-2">
            <span className="navbar__brand-mark">
              <FaBook />
            </span>
            <span className="text-lg font-extrabold text-ink-900">AI Bookstore</span>
          </div>
          <p className="footer__about">
            Personalized recommendations, real reviews, and a smarter way to find your next favorite book.
          </p>
          <div className="footer__social">
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

        <div>
          <h4 className="footer__title">Shop</h4>
          <div className="mt-3 space-y-2">
            <Link to="/books" className="footer__link">All books</Link>
            <Link to="/trending" className="footer__link">Trending</Link>
            <Link to="/recommended" className="footer__link">Recommended for you</Link>
            <Link to="/ai-search" className="footer__link">AI search</Link>
          </div>
        </div>

        <div>
          <h4 className="footer__title">Account</h4>
          <div className="mt-3 space-y-2">
            <Link to="/profile" className="footer__link">My profile</Link>
            <Link to="/orders" className="footer__link">Orders</Link>
            <Link to="/cart" className="footer__link">Cart</Link>
            {isAdmin && (
              <Link to="/admin" className="footer__link inline-flex items-center gap-1.5">
                <FaShieldAlt className="text-ink-400" /> Admin
              </Link>
            )}
          </div>
        </div>

        <div>
          <h4 className="footer__title">Stay in the loop</h4>
          <p className="mt-3 text-sm text-ink-500">
            New arrivals, featured reviews, and exclusive offers — once a week.
          </p>
          <form onSubmit={onSubscribe} className="footer__newsletter">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="footer__input"
              aria-label="Email for newsletter"
            />
            <Button type="submit" loading={submitting} size="sm">Join</Button>
          </form>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <p>© {new Date().getFullYear()} AI Bookstore — MERN + Semantic Recommendations</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-brand-700">Privacy</Link>
            <Link to="/terms" className="hover:text-brand-700">Terms</Link>
            <Link to="/contact" className="hover:text-brand-700">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
