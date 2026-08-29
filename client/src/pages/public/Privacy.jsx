/**
 * pages/public/Privacy.jsx — privacy policy.
 */
import LegalPage from "../../components/layout/LegalPage";
import { FaShieldAlt } from "react-icons/fa";

const privacySections = [
  {
    title: "1. Information we collect",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          <strong>Account information</strong> — name, email address, and hashed password when you
          register and manage your profile.
        </li>
        <li>
          <strong>Order information</strong> — billing and shipping addresses, order history, and
          payment status needed to fulfil and deliver your purchases.
        </li>
        <li>
          <strong>Reading preferences</strong> — genres, authors, ratings, wishlist items, and
          browsing activity used to power personalised recommendations.
        </li>
        <li>
          <strong>Technical data</strong> — device type, browser, IP address, and usage analytics to
          keep the store secure and improve performance.
        </li>
        <li>
          <strong>Communications</strong> — messages you send through customer support or the
          Assistant feature.
        </li>
      </ul>
    ),
  },
  {
    title: "2. How we use your information",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Process and deliver your orders, payments, and deliveries.</li>
        <li>Personalise book recommendations, trending lists, and search results.</li>
        <li>Send order updates, account notifications, and — with your consent — promotional emails.</li>
        <li>Prevent fraud, enforce our terms, and maintain security.</li>
        <li>Improve our products, features, and customer experience.</li>
      </ul>
    ),
  },
  {
    title: "3. Sharing your information",
    body: (
      <p>
        We never sell your personal data. We only share information with trusted service providers
        (such as payment processors and shipping carriers) who need it to deliver the services you
        use, and only to the extent required. We may disclose data where legally obliged or to
        protect our rights and users.
      </p>
    ),
  },
  {
    title: "4. Cookies and analytics",
    body: (
      <p>
        We use cookies and similar technologies to remember your cart and preferences, keep you
        signed in, and understand how visitors use the store. You can control or disable cookies in
        your browser settings, though some features may not work as intended without them.
      </p>
    ),
  },
  {
    title: "5. Data security",
    body: (
      <p>
        We apply industry-standard measures including encrypted transmission (HTTPS), password
        hashing, and restricted access controls to protect your information. No method of
        transmission over the internet is completely secure, but we work hard to safeguard your data.
      </p>
    ),
  },
  {
    title: "6. Data retention",
    body: (
      <p>
        We keep your personal information only as long as necessary to provide our services, comply
        with legal obligations, resolve disputes, and enforce agreements. When no longer needed, data
        is securely deleted or anonymised.
      </p>
    ),
  },
  {
    title: "7. Your rights and choices",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Access, correct, or update your account details at any time from your profile.</li>
        <li>Request deletion of your account and associated data.</li>
        <li>Opt out of marketing communications at any time.</li>
        <li>Manage notification and email preferences from your account settings.</li>
      </ul>
    ),
  },
  {
    title: "8. Changes to this policy",
    body: (
      <p>
        We may update this policy from time to time. Any changes will be posted on this page with an
        updated revision date. Continuing to use BookVerse after changes take effect constitutes
        acceptance of the revised policy.
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalPage
      icon={<FaShieldAlt />}
      title="Privacy policy"
      subtitle="Your reading data stays yours. Here's how we collect, use, and protect your information."
      updated="August 2026"
      sections={privacySections}
    />
  );
}
