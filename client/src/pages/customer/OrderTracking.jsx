/**
 * pages/customer/OrderTracking.jsx — dedicated order tracking with status timeline.
 */
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import orderApi from "../../services/orderApi";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import { formatDate, formatDateTime } from "../../utils/format";
import { ORDER_STATUS } from "../../config/constants";
import {
  FaArrowLeft,
  FaBox,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShippingFast,
  FaHome,
  FaTruck,
} from "react-icons/fa";

const STEP_ICONS = {
  pending: FaBox,
  confirmed: FaCheck,
  processing: FaCheckCircle,
  shipped: FaShippingFast,
  delivered: FaHome,
};

const STEP_COLORS = {
  completed: "bg-green-500 text-white",
  current: "bg-brand-600 text-white ring-4 ring-brand-100",
  upcoming: "bg-ink-200 text-ink-400",
  cancelled: "bg-red-500 text-white",
};

function TimelineStep({ step, isCancelled }) {
  const isCompleted = step.completed && !isCancelled;
  const isCurrent = step.completed && !isCancelled && step.key === "shipped";
  const Icon = STEP_ICONS[step.key] || FaBox;

  let statusClass;
  if (isCancelled && step.key !== "pending") {
    statusClass = STEP_COLORS.upcoming;
  } else if (isCancelled && step.key === "pending") {
    statusClass = STEP_COLORS.completed;
  } else if (isCompleted) {
    statusClass = STEP_COLORS.completed;
  } else if (isCurrent) {
    statusClass = STEP_COLORS.current;
  } else {
    statusClass = STEP_COLORS.upcoming;
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${statusClass}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="min-w-0 flex-1 pb-8">
        <p
          className={`text-sm font-semibold ${
            isCompleted || isCurrent ? "text-ink-900" : "text-ink-400"
          }`}
        >
          {step.label}
        </p>
        {step.date && (
          <p className="mt-0.5 text-xs text-ink-500">{formatDateTime(step.date)}</p>
        )}
        {!step.date && !isCompleted && (
          <p className="mt-0.5 text-xs text-ink-400">Pending</p>
        )}
      </div>
    </div>
  );
}

function ConnectorLine({ completed, isCancelled }) {
  return (
    <div className="ml-5 flex h-4 items-center">
      <div
        className={`h-full w-0.5 ${
          completed && !isCancelled ? "bg-green-500" : "bg-ink-200"
        }`}
      />
    </div>
  );
}

export default function OrderTracking() {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["order-tracking", id],
    queryFn: () => orderApi.tracking(id),
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
        <p className="font-medium text-red-700">Failed to load tracking info</p>
        <p className="text-sm text-red-600">
          {error?.response?.data?.error?.message || error?.message}
        </p>
        <Link
          to="/orders"
          className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const t = data?.tracking || {};
  const isCancelled = t.status === ORDER_STATUS.CANCELLED;
  const isDelivered = t.status === ORDER_STATUS.DELIVERED;
  const isShipped = t.status === ORDER_STATUS.SHIPPED;
  const steps = t.statusSteps || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to={`/orders/${id}`}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
        >
          <FaArrowLeft /> Back to order details
        </Link>
        <h1 className="text-2xl font-bold text-ink-900">Order tracking</h1>
        <p className="text-sm text-ink-500">
          {t.orderNumber || "—"} · Placed {formatDate(t.createdAt)}
        </p>
      </div>

      {isCancelled && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-700">This order has been cancelled</p>
              <p className="text-xs text-red-600">
                This order was cancelled and will not be delivered.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isCancelled && isDelivered && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-green-700">Order delivered</p>
              <p className="text-xs text-green-600">
                Your order has been delivered successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isCancelled && isShipped && t.estimatedDelivery && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
          <div className="flex items-center gap-3">
            <FaTruck className="h-5 w-5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-brand-700">Estimated delivery</p>
              <p className="text-xs text-brand-600">
                {formatDate(t.estimatedDelivery)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="mb-5 text-lg font-semibold text-ink-900">Status timeline</h2>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.key}>
              <TimelineStep step={step} isCancelled={isCancelled} />
              {i < steps.length - 1 && (
                <ConnectorLine completed={step.completed} isCancelled={isCancelled} />
              )}
            </div>
          ))}
        </div>
      </div>

      {t.trackingNumber && (
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
          <h2 className="mb-3 text-lg font-semibold text-ink-900">Shipping details</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">Tracking number</span>
              <span className="font-mono text-sm font-semibold text-ink-800">
                {t.trackingNumber}
              </span>
            </div>
            {t.shippingAddress && (
              <div className="border-t border-ink-100 pt-3">
                <p className="text-sm font-semibold text-ink-800">
                  {t.shippingAddress.recipient}
                </p>
                <p className="text-sm text-ink-600">{t.shippingAddress.phone}</p>
                <p className="text-sm text-ink-600">
                  {t.shippingAddress.street}, {t.shippingAddress.city},{" "}
                  {t.shippingAddress.state} {t.shippingAddress.postalCode},{" "}
                  {t.shippingAddress.country}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!t.trackingNumber && !isCancelled && !isDelivered && (
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <FaBox className="h-5 w-5 text-ink-400" />
            <div>
              <p className="text-sm font-semibold text-ink-700">Tracking number pending</p>
              <p className="text-xs text-ink-500">
                A tracking number will appear here once your order ships.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Button as={Link} to={`/orders/${id}`} variant="outline">
          View order details
        </Button>
      </div>
    </div>
  );
}
