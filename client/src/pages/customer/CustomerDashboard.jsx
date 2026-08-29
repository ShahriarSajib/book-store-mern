/**
 * pages/customer/CustomerDashboard.jsx — customer-facing analytics dashboard.
 * Shows total orders, completed orders, wishlist count, reviews given, total spent.
 */
import { useQuery } from "@tanstack/react-query";
import userApi from "../../services/userApi";
import { notificationApi } from "../../services/notificationApi";
import Spinner from "../../components/ui/Spinner";
import { formatCurrency, formatNumber, formatDate, formatDateTime } from "../../utils/format";
import { Link } from "react-router-dom";
import {
  FaBell,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaHeart,
  FaShoppingBag,
  FaStar,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-600",
    green: "border-green-200 bg-green-50 text-green-600",
    amber: "border-amber-200 bg-amber-50 text-amber-600",
    red: "border-red-200 bg-red-50 text-red-600",
    pink: "border-pink-200 bg-pink-50 text-pink-600",
    blue: "border-blue-200 bg-blue-50 text-blue-600",
  };
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${colors[color] || "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 opacity-60" />}
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-cyan-100 text-cyan-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function CustomerDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer", "dashboard"],
    queryFn: userApi.dashboard,
  });

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => notificationApi.list({ limit: 5 }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-indigo-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
        Could not load dashboard data.
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-sm text-slate-500">Your shopping activity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={formatNumber(stats.totalOrders)} icon={FaBox} color="indigo" />
        <StatCard label="Completed" value={formatNumber(stats.completedOrders)} icon={FaCheckCircle} color="green" />
        <StatCard label="Pending" value={formatNumber(stats.pendingOrders)} icon={FaClock} color="amber" />
        <StatCard label="Cancelled" value={formatNumber(stats.cancelledOrders)} icon={FaTimesCircle} color="red" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total spent" value={formatCurrency(stats.totalSpent)} icon={FaShoppingBag} color="blue" />
        <StatCard label="Wishlist items" value={formatNumber(stats.wishlistCount)} icon={FaHeart} color="pink" />
        <StatCard label="Reviews given" value={formatNumber(stats.reviewsGiven)} icon={FaStar} color="amber" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Quick actions</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/orders" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
            <FaBox className="mr-2 inline" /> Track order
          </Link>
          <Link to="/wishlist" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
            <FaHeart className="mr-2 inline" /> Wishlist
          </Link>
          <Link to="/notifications" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
            <FaBell className="mr-2 inline" /> Notifications
          </Link>
          <Link to="/profile" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
            <FaUser className="mr-2 inline" /> Profile
          </Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FaBell className="text-indigo-500" /> Notifications
            </h3>
            <Link to="/notifications" className="text-xs font-medium text-indigo-600 hover:underline">
              Settings
            </Link>
          </div>
          {!notifData || notifData.notifications?.length === 0 ? (
            <p className="py-4 text-sm text-slate-400">You&apos;re all caught up.</p>
          ) : (
            <div className="space-y-2">
              {notifData.notifications.map((n) => (
                <div key={n._id} className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 ${n.read ? "" : "bg-indigo-50"}`}>
                  <div className="min-w-0">
                    <p className={`text-sm ${n.read ? "text-slate-700" : "font-medium text-slate-900"}`}>{n.title}</p>
                    <p className="truncate text-xs text-slate-500">{n.message}</p>
                    <p className="text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Recent orders</h3>
            <Link to="/orders" className="text-xs font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-4 text-sm text-slate-400">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">#{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] || "bg-slate-100 text-slate-600"}`}>
                      {order.status}
                    </span>
                    <span className="font-medium text-slate-700">{formatCurrency(order.total)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
