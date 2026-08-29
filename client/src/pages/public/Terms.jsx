/**
 * pages/public/Terms.jsx — terms of service.
 */
import LegalPage from "../../components/layout/LegalPage";
import { FaFileContract } from "react-icons/fa";

const termsSections = [
  {
    title: "1. Acceptance of terms",
    body: (
      <p>
        By accessing or using BookVerse ("the Service"), you agree to be bound by these Terms of
        Service and our Privacy Policy. If you do not agree with any part of these terms, please do
        not use the Service.
      </p>
    ),
  },
  {
    title: "2. Eligibility and accounts",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>You must be at least the age of majority in your jurisdiction to make purchases.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You agree to provide accurate, current, and complete information when creating an account.</li>
        <li>You may not create accounts for fraudulent or abusive purposes.</li>
      </ul>
    ),
  },
  {
    title: "3. Orders and payments",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>All prices are listed in the applicable currency and may change without notice.</li>
        <li>We may decline or cancel an order for reasons including stock unavailability or suspected fraud.</li>
        <li>Payment is processed securely through our payment partners at the time of purchase.</li>
        <li>You agree to pay all charges associated with your purchases, including applicable taxes.</li>
      </ul>
    ),
  },
  {
    title: "4. Returns and refunds",
    body: (
      <p>
        Digital content and e-books are non-refundable once delivered. Physical books may be returned
        within the window stated at checkout, provided they are unread and in their original condition.
        Refunds are issued to the original payment method.
      </p>
    ),
  },
  {
    title: "5. Intellectual property",
    body: (
      <p>
        The Service, its design, software, and original content belong to BookVerse and its
        licensors. All book listings, cover art, and author information remain the property of their
        respective rights holders. You may not reproduce, copy, or exploit any part of the Service
        without prior written permission.
      </p>
    ),
  },
  {
    title: "6. Prohibited conduct",
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Attempting to gain unauthorised access to other accounts or systems.</li>
        <li>Reselling, redistributing, or scraping content without permission.</li>
        <li>Posting abusive, defamatory, or unlawful reviews or messages.</li>
        <li>Interfering with the security or operation of the Service.</li>
      </ul>
    ),
  },
  {
    title: "7. Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, BookVerse shall not be liable for any indirect,
        incidental, special, or consequential damages arising from your use of the Service. Our total
        liability is limited to the amount you paid for the order giving rise to the claim.
      </p>
    ),
  },
  {
    title: "8. Termination",
    body: (
      <p>
        We may suspend or terminate your access to the Service at our discretion if you breach these
        terms or engage in conduct that harms the community or platform.
      </p>
    ),
  },
  {
    title: "9. Changes to these terms",
    body: (
      <p>
        We may revise these Terms of Service from time to time. Updated terms will be posted on this
        page with an effective date. Your continued use of the Service after changes are posted
        constitutes acceptance of the revised terms.
      </p>
    ),
  },
];

export default function Terms() {
  return (
    <LegalPage
      icon={<FaFileContract />}
      title="Terms of service"
      subtitle="The rules that govern your use of BookVerse and what you can expect from us."
      updated="August 2026"
      sections={termsSections}
    />
  );
}
