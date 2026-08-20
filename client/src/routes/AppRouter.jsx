/**
 * routes/AppRouter.jsx — root route table.
 */
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
import AdminLayout from "../components/layout/AdminLayout.jsx";
import SemanticSearch from "../ai/pages/SemanticSearch.jsx";
import TrendingBooks from "../ai/pages/TrendingBooks.jsx";
import RecommendedForYou from "../ai/pages/RecommendedForYou.jsx";

// public pages
import Home from "../pages/public/Home.jsx";
import Books from "../pages/public/Books.jsx";
import BookDetails from "../pages/public/BookDetails.jsx";
import CategoryPage from "../pages/public/CategoryPage.jsx";
import AuthorPage from "../pages/public/AuthorPage.jsx";
import PublisherPage from "../pages/public/PublisherPage.jsx";
import SearchResults from "../pages/public/SearchResults.jsx";
import ComingSoon from "../pages/public/ComingSoon.jsx";
import NotFound from "../pages/public/NotFound.jsx";

// auth pages
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";

// customer pages
import Profile from "../pages/customer/Profile.jsx";
import Cart from "../pages/customer/Cart.jsx";
import Checkout from "../pages/customer/Checkout.jsx";
import Orders from "../pages/customer/Orders.jsx";
import OrderDetails from "../pages/customer/OrderDetails.jsx";
import OrderTracking from "../pages/customer/OrderTracking.jsx";
import CustomerDashboard from "../pages/customer/CustomerDashboard.jsx";
import NotificationPreferences from "../pages/customer/NotificationPreferences.jsx";
import Wishlist from "../pages/customer/Wishlist.jsx";
import Addresses from "../pages/customer/Addresses.jsx";
import ChatFullPage from "../pages/chatbot/ChatFullPage.jsx";
import PaymentSuccess from "../pages/customer/PaymentSuccess.jsx";
import PaymentCancelled from "../pages/customer/PaymentCancelled.jsx";

// admin pages
import AdminDashboard from "../pages/admin/Dashboard.jsx";
import AdminUsers from "../pages/admin/Users.jsx";
import AdminBooks from "../pages/admin/Books.jsx";
import AdminCategories from "../pages/admin/Categories.jsx";
import AdminAuthors from "../pages/admin/Authors.jsx";
import AdminPublishers from "../pages/admin/Publishers.jsx";
import AdminOrders from "../pages/admin/Orders.jsx";
import AdminInventory from "../pages/admin/Inventory.jsx";
import AdminReviews from "../pages/admin/Reviews.jsx";
import AdminCoupons from "../pages/admin/Coupons.jsx";
import AdminAnalytics from "../pages/admin/Analytics.jsx";
import AdminRecommendations from "../pages/admin/Recommendations.jsx";
import AdminAIAssistant from "../pages/admin/AIAssistant.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/books" element={<Books />} />
      <Route path="/books/:id" element={<BookDetails />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/categories/:id" element={<CategoryPage />} />
      <Route path="/authors/:id" element={<AuthorPage />} />
      <Route path="/publishers/:id" element={<PublisherPage />} />
      <Route path="/ai-search" element={<SemanticSearch />} />
      <Route path="/trending" element={<TrendingBooks />} />
      <Route path="/recommended" element={<RecommendedForYou />} />
      <Route path="/privacy" element={<ComingSoon title="Privacy policy" />} />
      <Route path="/terms" element={<ComingSoon title="Terms of service" />} />
      <Route path="/contact" element={<ComingSoon title="Contact us" />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Customer (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<NotificationPreferences />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/orders/:id/tracking" element={<OrderTracking />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile/addresses" element={<Addresses />} />
        <Route path="/chat" element={<ChatFullPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancelled />} />
      </Route>

      {/* Admin (admin-only) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/authors" element={<AdminAuthors />} />
          <Route path="/admin/publishers" element={<AdminPublishers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/recommendations" element={<AdminRecommendations />} />
          <Route path="/admin/ai" element={<AdminAIAssistant />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
