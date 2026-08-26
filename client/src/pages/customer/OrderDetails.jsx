/**
 * pages/customer/OrderDetails.jsx — items, status, cancel, invoice.
 */
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import orderApi from "../../services/orderApi";
import { useCartContext } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { formatDate, formatCurrency } from "../../utils/format";
import { ORDER_STATUS } from "../../config/constants";
import { FaArrowLeft, FaFileDownload, FaMapMarkerAlt, FaRedo, FaShoppingCart, FaTruck } from "react-icons/fa";
import paymentApi from "../../services/paymentApi";

const STATUS_STYLES = {
  [ORDER_STATUS.PENDING]: "bg-amber-100 text-amber-700",
  [ORDER_STATUS.CONFIRMED]: "bg-cyan-100 text-cyan-700",
  [ORDER_STATUS.PROCESSING]: "bg-blue-100 text-blue-700",
  [ORDER_STATUS.SHIPPED]: "bg-brand-100 text-brand-700",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-700",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-700",
};

const PAYMENT_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-accent-100 text-accent-700",
};

export default function OrderDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.get(id),
  });

  const { refresh: refreshCart } = useCartContext();

  const cancelMutation = useMutation({
    mutationFn: (reason) => orderApi.cancel(id, reason),
    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || "Could not cancel order"),
  });

  const reorderMutation = useMutation({
    mutationFn: () => orderApi.reorder(id),
    onSuccess: (data) => {
      toast.success(data?.message || "Items added to cart");
      refreshCart();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || "Could not reorder"),
  });

  const retryPayment = useMutation({
    mutationFn: async () => {
      const sessionData = await paymentApi.createCheckoutSession(id);
      if (sessionData?.url) {
        window.location.href = sessionData.url;
      }
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || "Could not start payment"),
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
        <p className="font-medium text-red-700">Failed to load this order</p>
        <p className="text-sm text-red-600">{error?.response?.data?.error?.message || error?.message}</p>
        <Link to="/orders" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const order = data?.order || {};
  const items = order.items || [];
  const address = order.shippingAddress || {};
  const cancellable =
    (order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED || order.status === ORDER_STATUS.PROCESSING) &&
    order.paymentStatus !== "paid";
  const canRetryPayment =
    order.paymentMethod === "card" &&
    order.paymentStatus === "pending" &&
    order.status === "pending";

  const handleCancel = () => {
    const reason = window.prompt("Reason for cancellation (optional):");
    if (reason === null) return;
    cancelMutation.mutate(reason);
  };

  const handleInvoice = async () => {
    try {
      const blob = await orderApi.invoice(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${order.orderNumber || id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Could not download invoice");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/orders"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
          >
            <FaArrowLeft /> Back to orders
          </Link>
          <h1 className="text-2xl font-bold text-ink-900">
            Order {order.orderNumber || `#${String(order._id || id).slice(-6)}`}
          </h1>
          <p className="text-sm text-ink-500">
            Placed {formatDate(order.createdAt)} ·{" "}
            {(order.paymentMethod || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/orders/${id}/tracking`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <FaTruck /> Track order
          </Link>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold capitalize ${
              STATUS_STYLES[order.status] || "bg-ink-100 text-ink-700"
            }`}
          >
            {order.status || "unknown"}
          </span>
          {order.paymentStatus && (
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                PAYMENT_STATUS_STYLES[order.paymentStatus] || "bg-ink-100 text-ink-700"
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleInvoice}>
            <FaFileDownload /> Invoice
          </Button>
        </div>
      </div>

      {address.recipient && (
        <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink-900">
            <FaMapMarkerAlt className="text-brand-600" /> Shipping address
          </h2>
          <p className="text-sm font-semibold text-ink-800">{address.recipient}</p>
          <p className="text-sm text-ink-600">{address.phone}</p>
          <p className="text-sm text-ink-600">
            {address.street}, {address.city}, {address.state} {address.postalCode},{" "}
            {address.country}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-semibold text-ink-900">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink-400">
              <tr className="border-b border-ink-100">
                <th className="pb-2 pr-4">Book</th>
                <th className="pb-2 pr-4">Qty</th>
                <th className="pb-2 pr-4">Price</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const bookId = item.book;
                const title = item.title || "Unknown book";
                const coverImage = item.coverImage;
                const qty = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                return (
                  <tr key={item._id || bookId || idx} className="border-b border-ink-50 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-ink-50">
                          {coverImage ? (
                            <img src={coverImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-ink-300">—</span>
                          )}
                        </div>
                        {bookId ? (
                          <Link
                            to={`/books/${bookId}`}
                            className="font-medium text-ink-800 hover:text-brand-700"
                          >
                            {title}
                          </Link>
                        ) : (
                          <span className="font-medium text-ink-800">{title}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-ink-600">{qty}</td>
                    <td className="py-3 pr-4 text-ink-600">{formatCurrency(price)}</td>
                    <td className="py-3 text-right font-medium text-ink-800">
                      {formatCurrency(price * qty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <dl className="ml-auto mt-4 max-w-xs space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Subtotal</dt>
            <dd className="font-medium text-ink-800">{formatCurrency(order.subtotal)}</dd>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">Discount</dt>
              <dd className="font-medium text-green-600">−{formatCurrency(order.discount)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Shipping</dt>
            <dd className="font-medium text-ink-800">{formatCurrency(order.shipping)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Tax</dt>
            <dd className="font-medium text-ink-800">{formatCurrency(order.tax)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-ink-100 pt-2 text-base">
            <dt className="font-semibold text-ink-900">Total</dt>
            <dd className="text-lg font-bold text-ink-900">{formatCurrency(order.total)}</dd>
          </div>
        </dl>
      </section>

      {cancellable && (
        <div className="flex justify-end gap-3">
          {canRetryPayment && (
            <Button
              variant="outline"
              loading={retryPayment.isLoading}
              onClick={() => retryPayment.mutate()}
            >
              <FaRedo /> Retry payment
            </Button>
          )}
          <Button variant="danger" loading={cancelMutation.isLoading} onClick={handleCancel}>
            Cancel order
          </Button>
        </div>
      )}

      {canRetryPayment && !cancellable && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            loading={retryPayment.isLoading}
            onClick={() => retryPayment.mutate()}
          >
            <FaRedo /> Retry payment
          </Button>
        </div>
      )}

      {(order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED) && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            loading={reorderMutation.isLoading}
            onClick={() => reorderMutation.mutate()}
          >
            <FaShoppingCart /> Reorder
          </Button>
        </div>
      )}
    </div>
  );
}
