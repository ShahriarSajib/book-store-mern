/**
 * hooks/useAuth.js — convenience hook over AuthContext.
 */
import { useAuthContext } from "../context/AuthContext";

export default function useAuth() {
  return useAuthContext();
}
