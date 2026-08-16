/**
 * pages/customer/Checkout.jsx — address, payment, place order.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import userApi from "../../services/userApi";
import orderApi from "../../services/orderApi";
import { useCartContext } from "../../context/CartContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { FaClipboardCheck, FaCreditCard, FaMapMarkerAlt } from "react-icons/fa";
import { formatCurrency } from "../../utils/format";

const PAYMENT_METHODS = [
  { value: "cash_on_delivery", label: "Cash on delivery" },
  { value: "card", label: "Credit / debit card" },
  { value: "bkash", label: "bKash" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, count, subtotal, discount, total, clearCart } = useCartContext();
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: userApi.getAddresses,
    keepPreviousData: true,
  });

  const placeOrder = useMutation({
    mutationFn: () =>
      orderApi.place({ shippingAddressId, paymentMethod, notes: notes.trim() || undefined }),
    onSuccess: (data) => {
      toast.success("Order placed successfully");
      clearCart();
      navigate(`/orders/${data?.order?._id || data?.order?.id}`);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error?.message || "Could not place your order"),
  });

  const addresses = data?.addresses || [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-ink-900">Checkout</h1>
        <EmptyState
          icon={FaClipboardCheck}
          title="Your cart is empty"
          description="Add some books to your cart before checking out."
          actionLabel="Browse books"
          onAction={() => navigate("/books")}
        />
      </div>
    );
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!shippingAddressId) {
      toast.error("Please choose a shipping address");
      return;
    }
    placeOrder.mutate();
  };

  return (
    <form onSubmit={handlePlaceOrder} className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Checkout</h1>
        <p className="text-sm text-ink-500">Review your order details and place it.</p>
      </div>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">
            <FaMapMarkerAlt className="text-brand-600" /> Shipping address
          </h2>
          <Link to="/profile/addresses" className="text-sm font-medium text-brand-600 hover:underline">
            Manage addresses
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8 text-brand-600">
            <Spinner className="h-6 w-6" />
          </div>
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={FaMapMarkerAlt}
            title="No saved addresses"
            description="Add an address so we know where to deliver your order."
            actionLabel="Add address"
            onAction={() => navigate("/profile/addresses")}
          />
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => {
              const addressId = address._id || address.id;
              return (
                <label
                  key={addressId}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                    shippingAddressId === addressId
                      ? "border-brand-500 bg-brand-50"
                      : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingAddress"
                    value={addressId}
                    checked={shippingAddressId === addressId}
                    onChange={(e) => setShippingAddressId(e.target.value)}
                    className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-ink-900">{address.label}</span>
                      {address.isDefault && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Default
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-ink-600">
                      {address.recipient} · {address.phone}
                    </span>
                    <span className="block text-sm text-ink-500">
                      {address.street}, {address.city}, {address.state} {address.postalCode},{" "}
                      {address.country}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink-900">
          <FaCreditCard className="text-brand-600" /> Payment method
        </h2>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                paymentMethod === method.value
                  ? "border-brand-500 bg-brand-50"
                  : "border-ink-200 hover:border-ink-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-medium text-ink-800">{method.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="mb-1 text-lg font-semibold text-ink-900">Order summary</h2>
        <p className="text-sm text-ink-500">
          {count} item{count === 1 ? "" : "s"} from your cart.
        </p>
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
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
        <Input
          label="Order notes (optional)"
          textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Delivery instructions, gift message…"
        />
        <Button type="submit" size="lg" fullWidth loading={placeOrder.isLoading} className="mt-4">
          Place order · {formatCurrency(total)}
        </Button>
      </section>
    </form>
  );
}
