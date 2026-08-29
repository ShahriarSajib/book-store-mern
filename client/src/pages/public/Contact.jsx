/**
 * pages/public/Contact.jsx — static contact information.
 */
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaPaperPlane } from "react-icons/fa";

const contactMethods = [
  {
    icon: <FaEnvelope />,
    title: "Email us",
    lines: ["hello@bookverse.com", "support@bookverse.com"],
  },
  {
    icon: <FaPhoneAlt />,
    title: "Call us",
    lines: ["+1 (555) 012-3456", "Mon–Fri, 9am–6pm"],
  },
  {
    icon: <FaMapMarkerAlt />,
    title: "Visit us",
    lines: ["55 Reader's Row, Book District", "Portland, OR 97201"],
  },
  {
    icon: <FaClock />,
    title: "Support hours",
    lines: ["Monday – Friday: 9am – 6pm", "Saturday: 10am – 4pm"],
  },
];

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
          <FaPaperPlane />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
          Contact us
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500">
          We'd love to hear from you. Reach out with questions about orders, returns, or your reading
          journey.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {contactMethods.map((method) => (
          <div
            key={method.title}
            className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-600">
              {method.icon}
            </span>
            <h2 className="mt-4 font-semibold text-ink-900">{method.title}</h2>
            {method.lines.map((line) => (
              <p key={line} className="mt-1 text-sm text-ink-600">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-ink-900">Order support</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          For help with a specific order, include your order number so we can assist you faster. You
          can also manage returns, track shipments, and view order details from your account anytime.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="mailto:support@bookverse.com"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <FaEnvelope /> Email support
          </a>
        </div>
      </div>
    </div>
  );
}
