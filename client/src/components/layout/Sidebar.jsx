/**
 * components/layout/Sidebar.jsx — admin sidebar with mobile drawer.
 */
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaBook,
  FaListAlt,
  FaUserEdit,
  FaClipboardList,
  FaBoxes,
  FaStar,
  FaTags,
  FaRobot,
  FaBuilding,
  FaChartLine,
  FaLightbulb,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const items = [
  { to: "/admin", label: "Dashboard", icon: FaChartBar, end: true },
  { to: "/admin/users", label: "Users", icon: FaUsers },
  { to: "/admin/books", label: "Books", icon: FaBook },
  { to: "/admin/categories", label: "Categories", icon: FaListAlt },
  { to: "/admin/authors", label: "Authors", icon: FaUserEdit },
  { to: "/admin/publishers", label: "Publishers", icon: FaBuilding },
  { to: "/admin/orders", label: "Orders", icon: FaClipboardList },
  { to: "/admin/inventory", label: "Inventory", icon: FaBoxes },
  { to: "/admin/reviews", label: "Reviews", icon: FaStar },
  { to: "/admin/coupons", label: "Coupons", icon: FaTags },
  { to: "/admin/analytics", label: "Analytics", icon: FaChartLine },
  { to: "/admin/recommendations", label: "Recommendations", icon: FaLightbulb },
  { to: "/admin/ai", label: "AI Assistant", icon: FaRobot },
];

function SidebarNav({ onLinkClick }) {
  return (
    <nav className="space-y-1">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onLinkClick}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          <Icon className="text-slate-400" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 md:hidden"
        aria-label="Open admin menu"
      >
        <FaBars />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 shadow-xl transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Admin Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>
        <SidebarNav onLinkClick={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-3 md:block">
        <SidebarNav />
      </aside>
    </>
  );
}
