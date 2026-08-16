/**
 * pages/public/Home.jsx
 * Hero + features + featured categories + auth flow CTA.
 * Uses the shared design tokens from styles/index.css so it matches the auth pages.
 */
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FaBook,
  FaBrain,
  FaShieldAlt,
  FaUserPlus,
  FaSignInAlt,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import catalogApi from "../../services/catalogApi";
import Button from "../../components/ui/Button";
import SemanticSearchBox from "../../components/recommendations/SemanticSearchBox";
import PersonalizedForYou from "../../components/recommendations/PersonalizedForYou";
import TrendingBooks from "../../components/recommendations/TrendingBooks";

const features = [
  {
    icon: FaBook,
    title: "Catalog & reviews",
    text: "Browse books by category, author and publisher, with real ratings and reviews.",
  },
  {
    icon: FaBrain,
    title: "Semantic search",
    text: "Search with natural language — embedding-based recommendations find what you mean.",
  },
  {
    icon: FaShieldAlt,
    title: "Role-based access",
    text: "Guests browse, customers buy, admins manage — enforced on every API call.",
  },
];

export default function Home() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  const { data: catData } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => catalogApi.categories.list(),
  });

  const categories = (catData?.items || []).slice(0, 4).map((c) => ({
    name: c.name,
    count: c.bookCount ?? "—",
  }));

  return (
    <div>
      {/* Hero */}
      <section className="section">
        <div className="hero px-6 py-16 sm:px-12 sm:py-24">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="chip border-white/40 bg-white/10 text-white/90 backdrop-blur">
              <FaStar className="text-amber-300" /> New: AI-curated weekly picks
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              The AI-powered{" "}
              <span className="bg-gradient-to-r from-amber-200 via-pink-200 to-white bg-clip-text text-transparent">
                bookstore
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-indigo-100 sm:text-lg">
              Discover books you&apos;ll love with semantic search, real reviews, and personalized
              recommendations tuned to your taste.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {!isLoading && isAuthenticated ? (
                <>
                  <Link to={isAdmin ? "/admin" : "/profile"}>
                    <Button size="lg" className="bg-white !text-brand-700 hover:!bg-white">
                      {isAdmin ? "Open admin panel" : "Go to my profile"}
                    </Button>
                  </Link>
                  <Link to="/books">
                    <Button size="lg" variant="ghost" className="!text-white hover:!bg-white/10">
                      Browse books <FaArrowRight />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-white !text-brand-700 hover:!bg-white">
                      <FaUserPlus /> Create account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="ghost" className="!text-white hover:!bg-white/10">
                      <FaSignInAlt /> Log in
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {!isLoading && isAuthenticated && (
              <p className="mt-5 text-sm text-indigo-100">
                Signed in as <span className="font-semibold text-white">{user.email}</span>
                <span className="ml-2 inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {user.role}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Why AI Bookstore
            </p>
            <h2 className="mt-1 text-2xl font-bold text-ink-900 sm:text-3xl">
              Built for how readers actually shop
            </h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="card p-6">
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl text-brand-600">
                <Icon />
              </span>
              <h3 className="text-base font-semibold text-ink-900">{title}</h3>
              <p className="mt-1 text-sm text-ink-500">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Browse
          </p>
          <h2 className="mt-1 text-2xl font-bold text-ink-900 sm:text-3xl">Popular categories</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to={`/books?category=${encodeURIComponent(c.name)}`}
              className="card flex items-center justify-between p-5 transition-transform hover:-translate-y-0.5"
            >
              <div>
                <p className="text-base font-semibold text-ink-900">{c.name}</p>
                <p className="text-xs text-ink-500">{c.count} titles</p>
              </div>
              <FaArrowRight className="text-brand-500" />
            </Link>
          ))}
        </div>
      </section>

      {/* AI Sections — each visually + functionally distinct */}

      {/* Section 1 — � AI Semantic Search */}
      <section className="section">
        <SemanticSearchBox />
      </section>

      {/* Section 3 — ✨ Recommended For You (auth-aware) */}
      <section className="section">
        <PersonalizedForYou />
      </section>

      {/* Section 4 — � Trending Books */}
      <section className="section">
        <TrendingBooks limit={8} />
      </section>

      {/* CTA */}
      <section className="section">
        <div className="card overflow-hidden p-8 sm:p-10">
          <div className="grid items-center gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">
                Try the full auth flow in seconds
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                Register, verify your email, log in, reset your password — every step is wired up
                end-to-end.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Link to="/register"><Button>Sign up</Button></Link>
              <Link to="/forgot-password"><Button variant="secondary">Forgot password</Button></Link>
              {isAdmin && (
                <Link to="/admin/users"><Button variant="ghost">Manage users</Button></Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
