/**
 * components/layout/Sidebar.jsx — admin sidebar.
 */
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

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-3 md:block">
      <nav className="space-y-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Icon className="text-slate-400" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
