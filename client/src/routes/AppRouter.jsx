/**
 * routes/AppRouter.jsx — root route table.
 *
 * Auth milestone: public Home + full auth flows + customer Profile
 * + admin Dashboard/Users. Everything else renders a ComingSoon placeholder.
 */
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
import AdminLayout from "../components/layout/AdminLayout.jsx";

// public pages
import Home from "../pages/public/Home.jsx";
import NotFound from "../pages/public/NotFound.jsx";
import ComingSoon from "../pages/public/ComingSoon.jsx";

// auth pages
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";

// customer pages
import Profile from "../pages/customer/Profile.jsx";

// admin pages
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import AdminUsers from "../pages/admin/Users.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/books" element={<ComingSoon title="Book catalog" />} />
      <Route path="/books/:id" element={<ComingSoon title="Book details" />} />
      <Route path="/search" element={<ComingSoon title="Search" />} />
      <Route path="/categories/:id" element={<ComingSoon title="Category" />} />
      <Route path="/authors/:id" element={<ComingSoon title="Author" />} />
      <Route path="/publishers/:id" element={<ComingSoon title="Publisher" />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Customer (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<ComingSoon title="Shopping cart" />} />
        <Route path="/checkout" element={<ComingSoon title="Checkout" />} />
        <Route path="/orders" element={<ComingSoon title="Order history" />} />
        <Route path="/orders/:id" element={<ComingSoon title="Order details" />} />
        <Route path="/wishlist" element={<ComingSoon title="Wishlist" />} />
        <Route path="/profile/addresses" element={<ComingSoon title="Saved addresses" />} />
        <Route path="/chat" element={<ComingSoon title="AI Chat Assistant" />} />
      </Route>

      {/* Admin (admin-only) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/books" element={<ComingSoon title="Admin · Books" />} />
          <Route path="/admin/categories" element={<ComingSoon title="Admin · Categories" />} />
          <Route path="/admin/authors" element={<ComingSoon title="Admin · Authors" />} />
          <Route path="/admin/publishers" element={<ComingSoon title="Admin · Publishers" />} />
          <Route path="/admin/orders" element={<ComingSoon title="Admin · Orders" />} />
          <Route path="/admin/inventory" element={<ComingSoon title="Admin · Inventory" />} />
          <Route path="/admin/reviews" element={<ComingSoon title="Admin · Reviews" />} />
          <Route path="/admin/coupons" element={<ComingSoon title="Admin · Coupons" />} />
          <Route path="/admin/analytics" element={<ComingSoon title="Admin · Analytics" />} />
          <Route path="/admin/ai" element={<ComingSoon title="Admin · AI Assistant" />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
