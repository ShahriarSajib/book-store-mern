/**
 * components/cart/CartSummary.jsx — totals, coupon, checkout actions.
 */
import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import Button from "../../components/ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import CouponInput from "./CouponInput";
import { formatCurrency } from "../../utils/format";

export default function CartSummary({
  items,
  subtotal,
  discount,
  total,
  onApplyCoupon,
  coupon,
  isApplying,
  onCheckout,
  onClear,
}) {
  const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const [clearOpen, setClearOpen] = useState(false);

  return (
    <aside className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink-900">
        <FaShoppingCart className="text-brand-600" />
        Summary ({count} item{count === 1 ? "" : "s"})
      </div>

      <CouponInput
        onApply={onApplyCoupon}
        disabled={isApplying}
        appliedCode={coupon?.code}
        discount={discount}
      />

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink-500">Subtotal</dt>
          <dd className="font-medium text-ink-800">{formatCurrency(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between">
            <dt className="text-ink-500">Discount</dt>
            <dd className="font-medium text-green-600">−{formatCurrency(discount)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-ink-100 pt-2 text-base">
          <dt className="font-semibold text-ink-900">Total</dt>
          <dd className="text-lg font-bold text-ink-900">{formatCurrency(total)}</dd>
        </div>
      </dl>

      <Button fullWidth className="mt-5" onClick={onCheckout}>
        Proceed to checkout
      </Button>

      <Button variant="ghost" fullWidth className="mt-2" onClick={() => setClearOpen(true)}>
        Clear cart
      </Button>

      <ConfirmModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          setClearOpen(false);
          onClear();
        }}
        title="Clear cart"
        message="Are you sure you want to remove all items from your cart? This cannot be undone."
        confirmLabel="Clear cart"
      />
    </aside>
  );
}
