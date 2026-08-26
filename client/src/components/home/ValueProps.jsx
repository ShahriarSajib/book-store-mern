/**
 * components/home/ValueProps.jsx
 * Benefits / features section — communicates "why shop with us" using
 * presentational copy only. No data fetching.
 */
import {
  FaBookOpen,
  FaBrain,
  FaCheck,
  FaShieldAlt,
  FaStar,
  FaTruck,
} from "react-icons/fa";
import useReveal from "../../hooks/useReveal";

const PROPS = [
  {
    icon: FaBookOpen,
    cls: "lp-prop__icon--brand",
    title: "Vast curated catalog",
    text: "Browse books by category, author, and publisher — with real ratings and reviews on every title.",
    bullets: ["Browse by category, author, publisher", "Real ratings & reviews"],
  },
  {
    icon: FaBrain,
    cls: "lp-prop__icon--accent",
    title: "AI semantic search",
    text: "Search the way you think. Type a phrase, get books that match the meaning — not just keywords.",
    bullets: ["Natural-language queries", "Embedding-based ranking"],
  },
  {
    icon: FaShieldAlt,
    cls: "lp-prop__icon--gold",
    title: "Safe & role-based",
    text: "Guests browse, customers buy, admins manage — enforced on every API call end-to-end.",
    bullets: ["Verified reviewers", "Role-based access"],
  },
  {
    icon: FaTruck,
    cls: "lp-prop__icon--rose",
    title: "Fast & flexible delivery",
    text: "Express delivery in 24 hours, free shipping over $35, and a 30-day no-hassle return window.",
    bullets: ["24h express delivery", "30-day easy returns"],
  },
];

export default function ValueProps() {
  const ref = useReveal();
  return (
    <section className="section" aria-labelledby="lp-props-title" ref={ref}>
      <div className="lp-reveal mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600">
          Why BookVerse
        </p>
        <h2
          id="lp-props-title"
          className="mt-2 text-2xl font-extrabold text-ink-900 sm:text-3xl"
        >
          Built for how readers actually shop
        </h2>
        <p className="mt-3 text-sm text-ink-700 sm:text-base">
          A modern bookstore experience, powered by AI and tuned for book lovers.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {PROPS.map(({ icon: Icon, cls, title, text, bullets }) => (
          <article key={title} className="lp-prop">
            <span className={`lp-prop__icon ${cls}`}>
              <Icon />
            </span>
            <h3 className="lp-prop__title">{title}</h3>
            <p className="lp-prop__text">{text}</p>
            <ul className="lp-prop__list">
              {bullets.map((b) => (
                <li key={b}>
                  <span className="lp-prop__check">
                    <FaCheck />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Reader testimonial — marketing copy, no backend call */}
      <article className="lp-quote mt-10">
        <span className="lp-quote__mark" aria-hidden>
          <FaStar />
        </span>
        <p className="lp-quote__body">
          “The semantic search is uncanny — I described the kind of book I wanted
          in one sentence and the top three results were exactly what I would
          have picked myself. It&apos;s the first store where I trust the
          recommendations.”
        </p>
        <div className="lp-quote__meta">
          <span className="lp-quote__avatar">A</span>
          <div>
            <div className="lp-quote__name">Aisha R.</div>
            <div className="lp-quote__role">Verified buyer · Mystery &amp; sci-fi</div>
          </div>
        </div>
      </article>
    </section>
  );
}