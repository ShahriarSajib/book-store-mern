/**
 * pages/auth/AuthShell.jsx — centered card shell for auth pages.
 */
import { Link } from "react-router-dom";
import cn from "../../utils/cn";

export default function AuthShell({ title, subtitle, footer, children, wide = false }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center py-8">
      <div className={cn("w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm", wide && "max-w-2xl mx-auto")}>
        <div className="mb-6 text-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            📚 AI Bookstore
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </div>
      {footer && <p className="mt-4 text-center text-sm text-slate-500">{footer}</p>}
    </div>
  );
}
