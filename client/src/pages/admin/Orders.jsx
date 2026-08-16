/**
 * pages/admin/Orders.jsx — view/filter/update/cancel/ship orders.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import adminApi from "../../services/adminApi";
import { ORDER_STATUS } from "../../config/constants";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { FaSearch } from "react-icons/fa";
import { formatCurrency, formatDate } from "../../utils/format";

const PAGE_SIZE = 10;

const labelize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const getId = (item) => item?._id || item?.id;

function PaymentBadge({ status }) {
  const cls =
    status === "paid"
      ? "bg-green-100 text-green-700"
      : status === "refunded"
        ? "bg-slate-100 text-slate-600"
        : status === "failed"
          ? "bg-red-100 text-red-700"
          : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>
      {status ? labelize(status) : "—"}
    </span>
  );
}

export default function Orders() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin", "orders", { status, search, page }],
    queryFn: () =>
      adminApi.orders.list({
        status: status || undefined,
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
      }),
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) => adminApi.orders.update(id, patch),
    onSuccess: () => {
      toast.success("Order updated");
      invalidate();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || err?.message || "Update failed"),
  });

  const resetFilters = () => {
    setStatus("");
    setSearch("");
    setPage(1);
  };

  const orders = data?.orders || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Order management</h1>
        <p className="text-sm text-slate-500">View, filter and update customer orders.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search order number…"
              className="w-64 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </form>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          {Object.values(ORDER_STATUS).map((value) => (
            <option key={value} value={value}>
              {labelize(value)}
            </option>
          ))}
        </select>

        {(status || search) && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-indigo-600">
          <Spinner className="h-8 w-8" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No orders match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={getId(order)} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {order.orderNumber || getId(order)}
                  </td>
                  <td className="max-w-[200px] px-4 py-3 text-slate-600">
                    {order.user?.name || order.shippingAddress?.recipient || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-600">{order.items?.length || 0}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateMutation.mutate({
                          id: getId(order),
                          patch: { status: e.target.value },
                        })
                      }
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm capitalize focus:border-indigo-500 focus:outline-none"
                    >
                      {Object.values(ORDER_STATUS).map((value) => (
                        <option key={value} value={value}>
                          {labelize(value)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className="block text-xs text-slate-500">
                        {order.paymentMethod || "—"}
                      </span>
                      <PaymentBadge status={order.paymentStatus} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <span className="text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} orders)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {isFetching && !isLoading && <p className="text-xs text-slate-400">Updating…</p>}
    </div>
  );
}
