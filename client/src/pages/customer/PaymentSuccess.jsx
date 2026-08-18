/**
 * pages/customer/PaymentSuccess.jsx — shown after Stripe checkout succeeds.
 * Polls order status briefly, then shows confirmation.
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import orderApi from "../../services/orderApi";
import Button from "../../components/ui/Button";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const data = await orderApi.get(orderId);
        const o = data?.order;
        if (o?.paymentStatus === "paid" || attempts >= maxAttempts) {
          setOrder(o);
          setLoading(false);
          clearInterval(interval);
        }
      } catch {
        if (attempts >= maxAttempts) {
          setLoading(false);
          clearInterval(interval);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <FaSpinner className="mx-auto h-12 w-12 animate-spin text-brand-600" />
        <h1 className="text-2xl font-bold text-ink-900">Processing your payment...</h1>
        <p className="text-sm text-ink-500">
          We&apos;re confirming your order. This won&apos;t take long.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-3xl text-red-500">!</span>
        </div>
        <h1 className="text-2xl font-bold text-ink-900">Something went wrong</h1>
        <p className="text-sm text-ink-500">{error}</p>
        <Button as={Link} to="/orders">
          View orders
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <FaCheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Payment successful!</h1>
        <p className="mt-2 text-sm text-ink-500">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {order && (
        <div className="rounded-2xl border border-ink-100 bg-white p-6 text-left shadow-soft">
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">Order number</dt>
              <dd className="font-medium text-ink-800">{order.orderNumber}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">Payment status</dt>
              <dd className="font-medium capitalize text-green-600">{order.paymentStatus}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-500">Total</dt>
              <dd className="font-bold text-ink-900">
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: "USD",
                }).format(order.total)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderId && (
          <Button as={Link} to={`/orders/${orderId}`} variant="outline">
            View order details
          </Button>
        )}
        <Button as={Link} to="/books">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
