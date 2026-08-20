/**
 * context/CartContext.jsx
 * Responsibility:
 *   Server-backed cart state. Loads the user's cart from /cart, exposes
 *   add/remove/update/clear/applyCoupon and derived totals/count.
 *   addItem accepts { book: { id, title, price, coverImage }, quantity }.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import cartApi from "../services/cartApi";
import useAuth from "../hooks/useAuth";

const CartContext = createContext(null);

function toLocalItem(item) {
  const book = item.book || {};
  return {
    bookId: String(book._id || book.id || item.book),
    quantity: item.quantity,
    price: item.price,
    title: book.title || "",
    coverImage: book.coverImage || "",
    authors: book.authors || [],
    stock: book.stock,
  };
}

function getErrorMessage(err) {
  return err?.response?.data?.error?.message || err?.message || "Something went wrong";
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const applyServerCart = useCallback((data) => {
    const cart = data?.cart;
    setItems((cart?.items || []).map(toLocalItem));
    setCoupon(cart?.coupon || null);
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setCoupon(null);
      return;
    }
    try {
      applyServerCart(await cartApi.get());
    } catch (_err) {
      // ignore — cart stays as-is on transient failures
    }
  }, [isAuthenticated, applyServerCart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async ({ book, quantity = 1 }) => {
      if (!isAuthenticated) {
        toast.error("Please log in to add items to your cart");
        return false;
      }
      const bookId = book?.id || book?._id;
      if (!bookId) return false;
      setIsUpdating(true);
      try {
        applyServerCart(await cartApi.add(bookId, quantity));
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err));
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, applyServerCart]
  );

  const removeItem = useCallback(
    async (bookId) => {
      setIsUpdating(true);
      try {
        applyServerCart(await cartApi.remove(bookId));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setIsUpdating(false);
      }
    },
    [applyServerCart]
  );

  const updateItem = useCallback(
    async (bookId, quantity) => {
      if (quantity < 1) return removeItem(bookId);
      setIsUpdating(true);
      try {
        applyServerCart(await cartApi.update(bookId, quantity));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setIsUpdating(false);
      }
    },
    [applyServerCart, removeItem]
  );

  const clearCart = useCallback(async () => {
    setIsUpdating(true);
    try {
      await cartApi.clear();
      setItems([]);
      setCoupon(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const applyCoupon = useCallback(
    async (code) => {
      setIsUpdating(true);
      try {
        applyServerCart(await cartApi.applyCoupon(code));
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err));
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [applyServerCart]
  );

  const removeCoupon = useCallback(async () => {
    setIsUpdating(true);
    try {
      applyServerCart(await cartApi.removeCoupon());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  }, [applyServerCart]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  const discount = coupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount,
      total,
      coupon,
      isOpen,
      setCartOpen: setIsOpen,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      refresh,
      isUpdating,
    }),
    [
      items,
      coupon,
      subtotal,
      discount,
      total,
      isOpen,
      addItem,
      removeItem,
      updateItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      refresh,
      isUpdating,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}

export default CartProvider;
