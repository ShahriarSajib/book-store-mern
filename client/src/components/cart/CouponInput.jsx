/**
 * components/cart/CouponInput.jsx — coupon code entry + applied chip.
 */
import { useState } from "react";
import { FaCheckCircle, FaTag } from "react-icons/fa";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../utils/format";

export default function CouponInput({ onApply, disabled, appliedCode, discount }) {
  const [code, setCode] = useState("");

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
        <FaCheckCircle className="shrink-0 text-green-500" />
        <span>
          Code <span className="font-semibold uppercase">{appliedCode}</span> applied (−
          {formatCurrency(discount)})
        </span>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    onApply?.(code.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <FaTag className="pointer-events-none absolute left-3 top-2.5 text-ink-400" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          disabled={disabled}
          className="w-full rounded-lg border border-ink-200 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-ink-50"
        />
      </div>
      <Button type="submit" size="sm" disabled={disabled || !code.trim()}>
        Apply
      </Button>
    </form>
  );
}
