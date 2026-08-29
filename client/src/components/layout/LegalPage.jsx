/**
 * components/layout/LegalPage.jsx — shared shell for static legal/static info pages
 * (Privacy, Terms). Renders a hero header plus list of sections.
 */
import { Link } from "react-router-dom";

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-ink-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-600">{children}</div>
    </section>
  );
}

export default function LegalPage({ icon, title, subtitle, updated, sections }) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
          {icon}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500">{subtitle}</p>
        {updated && (
          <p className="mt-4 inline-block rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-medium text-ink-500">
            Last updated: {updated}
          </p>
        )}
      </header>

      <div className="space-y-5">
        {sections.map((section) => (
          <Section key={section.title} title={section.title}>
            {section.body}
          </Section>
        ))}
      </div>

      <footer className="mt-10 text-center text-sm text-ink-500">
        Have questions?{" "}
        <Link to="/contact" className="font-medium text-brand-600 hover:text-brand-700">
          Contact us
        </Link>
        .
      </footer>
    </div>
  );
}
