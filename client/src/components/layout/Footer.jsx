/**
 * components/layout/Footer.jsx
 */
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function Footer() {
  const { isAdmin } = useAuth();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} AI Bookstore — MERN + Semantic Recommendations</p>
        <nav className="flex items-center gap-4">
          <Link to="/books" className="hover:text-indigo-600">
            Books
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hover:text-indigo-600">
              Admin
            </Link>
          )}
        </nav>
      </div>
    </footer>
  );
}
