/**
 * pages/admin/Dashboard.jsx
 */
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import adminApi from "../../services/adminApi";
import Spinner from "../../components/ui/Spinner";
import { FaUsers, FaBook, FaClipboardList, FaDollarSign, FaHourglassHalf, FaUserCheck } from "react-icons/fa";
import { formatNumber, formatCurrency } from "../../utils/format";

const cards = [
  { key: "users", label: "Total users", icon: FaUsers },
  { key: "activeUsers", label: "Active users", icon: FaUserCheck },
  { key: "books", label: "Books", icon: FaBook },
  { key: "orders", label: "Orders", icon: FaClipboardList },
  { key: "pendingOrders", label: "Pending orders", icon: FaHourglassHalf },
];

export default function Dashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">Failed to load dashboard</p>
        <p className="text-sm text-red-600">{error?.message}</p>
        <button className="mt-3 text-sm font-medium text-red-700 underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const { stats, recentUsers } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your bookstore.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, label, icon: Icon }) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats[key] === null || stats[key] === undefined ? "—" : formatNumber(stats[key])}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon />
              </span>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.revenue === null || stats.revenue === undefined ? "—" : formatCurrency(stats.revenue)}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FaDollarSign />
            </span>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent signups</h2>
          <Link to="/admin/users" className="text-sm font-medium text-brand-600 hover:underline">
            View all users
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-slate-500">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 font-medium text-slate-800">{u.name}</td>
                    <td className="py-2 pr-4 text-slate-600">{u.email}</td>
                    <td className="py-2 pr-4">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2">
                      {u.isActive ? (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">Active</span>
                      ) : (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">Disabled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
