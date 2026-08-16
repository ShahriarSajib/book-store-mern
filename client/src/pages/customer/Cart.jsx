/**
 * pages/customer/Cart.jsx — full cart page.
 */
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCartContext } from "../../context/CartContext";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyState from "../../components/ui/EmptyState";

export default function Cart() {
  const navigate = useNavigate();
  const {
    items,
    count,
    subtotal,
    discount,
    total,
    coupon,
    removeItem,
    updateItem,
    clearCart,
    applyCoupon,
    isUpdating,
  } = useCartContext();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            Your cart ({count} item{count === 1 ? "" : "s"})
          </h1>
          <p className="text-sm text-ink-500">Review your items before checking out.</p>
        </div>
        <Link to="/books" className="text-sm font-medium text-brand-600 hover:underline">
          Continue shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={FaShoppingCart}
          title="Your cart is empty"
          description="Browse the catalog and find your next favorite book."
          actionLabel="Browse books"
          onAction={() => navigate("/books")}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.bookId}
                item={item}
                disabled={isUpdating}
                onUpdate={(qty) => updateItem(item.bookId, qty)}
                onRemove={() => removeItem(item.bookId)}
              />
            ))}
          </div>
          <CartSummary
            items={items}
            subtotal={subtotal}
            discount={discount}
            total={total}
            coupon={coupon}
            isApplying={isUpdating}
            onApplyCoupon={applyCoupon}
            onCheckout={() => navigate("/checkout")}
            onClear={clearCart}
          />
        </div>
      )}
    </div>
  );
}
