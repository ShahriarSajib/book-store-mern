/**
 * pages/customer/PaymentCancelled.jsx — shown when Stripe checkout is cancelled.
 */
import { Link, useSearchParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import Button from "../../components/ui/Button";

export default function PaymentCancelled() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <FaTimesCircle className="h-10 w-10 text-amber-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Payment cancelled</h1>
        <p className="mt-2 text-sm text-ink-500">
          Your payment was not completed. No charges were made.
        </p>
        <p className="mt-1 text-sm text-ink-500">
          You can try again from your order details or choose a different payment method.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderId && (
          <Button as={Link} to={`/orders/${orderId}`} variant="outline">
            View order
          </Button>
        )}
        <Button as={Link} to="/checkout">
          Try again
        </Button>
        <Button as={Link} to="/books" variant="ghost">
          Continue browsing
        </Button>
      </div>
    </div>
  );
}
