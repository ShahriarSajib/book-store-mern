/**
 * routes/AdminRoute.jsx — gates admin-only routes.
 */
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/ui/Spinner";
import { ROLES } from "../config/constants";

export default function AdminRoute() {
  const { user, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-indigo-600">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role !== ROLES.ADMIN) return <Navigate to="/" replace />;

  return <Outlet />;
}
