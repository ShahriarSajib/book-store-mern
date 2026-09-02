/**
 * components/layout/Sidebar.jsx — admin sidebar (desktop) + mobile drawer.
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
  { to: "/admin/ai", label: "AI Assistant", icon: FaRobot },
];

function NavLinkInner({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
    >
      <Icon className="text-slate-400" />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-3 md:block">
        <nav className="space-y-1">
          {items.map((item) => (
            <NavLinkInner key={item.to} {...item} onNavigate={close} />
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-16 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 md:hidden">
        <span className="text-sm font-bold text-slate-900">Admin</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
          aria-label="Toggle admin menu"
          aria-expanded={open}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          <nav className="grid grid-cols-2 gap-1">
            {items.map((item) => (
              <NavLinkInner key={item.to} {...item} onNavigate={close} />
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
