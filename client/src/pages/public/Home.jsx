/**
 * pages/public/Home.jsx
 * Landing page. Composes the marketing narrative out of focused sections
 * that all rely on EXISTING backend endpoints and components.
 *
 *  ┌─────────────────────────────────────────────────────┐
 *  │ HomeHero  (auth-aware CTA, decorative visual)       │
 *  │ HomeStats  (marketing strip, static copy)          │
 *  │ CategoryShowcase  (GET /api/categories)            │
 *  │ FeaturedBooks  (GET /api/books?sort=-rating)       │
 *  │ SemanticSearchBox  (existing — GET /semantic-search)│
 *  │ PersonalizedForYou  (existing — auth-aware)         │
 *  │ TrendingBooks  (existing — GET /trending)           │
 *  │ ValueProps  (benefits + testimonial, static)       │
 *  │ FinalCTA  (closing call to action)                  │
 *  └─────────────────────────────────────────────────────┘
 *
 * No backend, route, auth, or service contract changes — presentation only.
 */
import { useQuery } from "@tanstack/react-query";
import catalogApi from "../../services/catalogApi";
import useAuth from "../../hooks/useAuth";
import SemanticSearchBox from "../../components/recommendations/SemanticSearchBox";
import PersonalizedForYou from "../../components/recommendations/PersonalizedForYou";
import TrendingBooks from "../../components/recommendations/TrendingBooks";

import HomeHero from "../../components/home/HomeHero";
import HomeStats from "../../components/home/HomeStats";
import CategoryShowcase from "../../components/home/CategoryShowcase";
import FeaturedBooks from "../../components/home/FeaturedBooks";
import ValueProps from "../../components/home/ValueProps";
import FinalCTA from "../../components/home/FinalCTA";

export default function Home() {
  const { user, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

  const { data: catData } = useQuery({
    queryKey: ["home-categories"],
    queryFn: () => catalogApi.categories.list(),
  });

  const categories = (catData?.items || []).map((c) => ({
    name: c.name,
    count: c.bookCount ?? null,
  }));

  return (
    <div className="space-y-2">
      <section className="section pt-10 pb-2 sm:pt-14">
        <HomeHero
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          user={user}
          isAuthLoading={isAuthLoading}
        />
      </section>

      <HomeStats />

      <CategoryShowcase categories={categories.slice(0, 8)} />

      <FeaturedBooks limit={8} />

      <section className="section">
        <SemanticSearchBox />
      </section>

      <section className="section">
        <PersonalizedForYou />
      </section>

      <section className="section">
        <TrendingBooks limit={8} />
      </section>

      <ValueProps />

      <FinalCTA isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
    </div>
  );
}