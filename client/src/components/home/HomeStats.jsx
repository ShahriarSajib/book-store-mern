/**
 * components/home/HomeStats.jsx
 * Quick at-a-glance social-proof strip. Pure presentation — values are
 * illustrative marketing copy, not fabricated backend data.
 */
import {
  FaBookOpen,
  FaFire,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";

const STATS = [
  { icon: FaBookOpen, value: "10K+", label: "Titles in catalog" },
  { icon: FaFire, value: "1.2M", label: "Books read this year" },
  { icon: FaShieldAlt, value: "100%", label: "Verified reviews" },
  { icon: FaTruck, value: "24h", label: "Express delivery" },
];

export default function HomeStats() {
  return (
    <section aria-label="Bookstore highlights" className="py-6">
      <div className="lp-stats">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="lp-stat">
            <span className="lp-stat__icon">
              <Icon />
            </span>
            <div>
              <div className="lp-stat__value">{value}</div>
              <div className="lp-stat__label">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}