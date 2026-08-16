/**
 * hooks/useCart.js — convenience hook over CartContext.
 */
import { useCartContext } from "../context/CartContext";

export default function useCart() {
  return useCartContext();
}
