/**
 * context/CartContext.jsx
 * Responsibility:
 *   Placeholder cart state (persisted locally) until the cart module ships.
 *   Exposes the same API shape the UI components expect.
 */
import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      isOpen,
      setCartOpen: setIsOpen,
      addItem: () => {},
      removeItem: () => {},
      updateItem: () => {},
      clearCart: () => {},
      isUpdating: false,
    }),
    [items, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}

export default CartProvider;
