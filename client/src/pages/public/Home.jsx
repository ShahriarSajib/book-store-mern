/**
 * pages/public/Home.jsx
 *   Hero + feature highlights. Auth-focused landing.
 */
import { Link } from "react-router-dom";
import { FaBook, FaBrain, FaShieldAlt, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/ui/Button";

const features = [
  {
    icon: FaBook,
    title: "Catalog & reviews",
    text: "Browse books by category, author and publisher, with ratings and reviews.",
  },
  {
    icon: FaBrain,
    title: "Semantic search",
    text: "Search with natural language, powered by embedding-based book recommendations.",
  },
  {
    icon: FaShieldAlt,
    title: "Role-based access",
    text: "Guests browse, customers buy, admins manage — enforced on every API call.",
  },
];

export default function Home() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-3xl pt-14 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          The AI-powered{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            bookstore
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Discover books you'll love with semantic search and personalized recommendations.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {isLoading ? null : isAuthenticated ? (
            <>
              <Link to={isAdmin ? "/admin" : "/profile"}>
                <Button size="lg">{isAdmin ? "Open admin panel" : "Go to my profile"}</Button>
              </Link>
              <Link to="/books">
                <Button variant="outline" size="lg">
                  Browse books
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg">
                  <FaUserPlus /> Create account
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  <FaSignInAlt /> Log in
                </Button>
              </Link>
            </>
          )}
        </div>

        {!isLoading && isAuthenticated && (
          <p className="mt-4 text-sm text-slate-500">
            Signed in as <span className="font-medium text-slate-700">{user.email}</span> ({user.role})
          </p>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
              <Icon />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-2xl rounded-2xl bg-indigo-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Try the authentication flows</h2>
        <p className="mt-2 text-sm text-slate-600">
          Register, verify your email, log in, reset your password, and manage users with role-based admin access.
          <br />
          Admin login: <code className="rounded bg-white px-1.5 py-0.5 text-xs">admin@bookstore.com</code> /{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">Admin@12345</code>
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button>Sign up</Button>
          </Link>
          <Link to="/forgot-password">
            <Button variant="outline">Forgot password</Button>
          </Link>
          {isAdmin && (
            <Link to="/admin/users">
              <Button variant="secondary">Manage users</Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
