/**
 * pages/customer/Orders.jsx — list of customer orders.
 */
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import orderApi from "../../services/orderApi";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, formatCurrency } from "../../utils/format";
import { ORDER_STATUS } from "../../config/constants";
import { FaClipboardList } from "react-icons/fa";

const STATUS_STYLES = {
  [ORDER_STATUS.PENDING]: "bg-amber-100 text-amber-700",
  [ORDER_STATUS.CONFIRMED]: "bg-cyan-100 text-cyan-700",
  [ORDER_STATUS.PROCESSING]: "bg-blue-100 text-blue-700",
  [ORDER_STATUS.SHIPPED]: "bg-brand-100 text-brand-700",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-700",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || "bg-ink-100 text-ink-700"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}

export default function Orders() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.list,
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-brand-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="font-medium text-red-700">Failed to load your orders</p>
        <p className="text-sm text-red-600">{error?.response?.data?.error?.message || error?.message}</p>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My orders</h1>
        <p className="text-sm text-ink-500">Track your orders and download invoices.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={FaClipboardList}
          title="No orders yet"
          description="Your placed orders will appear here."
          actionLabel="Browse books"
          onAction={() => navigate("/books")}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderId = order._id || order.id;
            const itemsCount = (order.items || []).reduce(
              (sum, item) => sum + (Number(item.quantity) || 0),
              0
            );
            return (
              <Link
                key={orderId}
                to={`/orders/${orderId}`}
                className="block rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">
                      {order.orderNumber || `#${String(orderId || "").slice(-6) || "—"}`}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-500">
                      Placed {formatDate(order.createdAt)} · {itemsCount} item
                      {itemsCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-base font-bold text-ink-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
