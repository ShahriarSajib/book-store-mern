/**
 * routes/AppRouter.jsx — root route table with code splitting.
 */
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
import Spinner from "../components/ui/Spinner";

function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<PageSpinner />}>{children}</Suspense>
);

// public pages
const Home = lazy(() => import("../pages/public/Home.jsx"));
const Books = lazy(() => import("../pages/public/Books.jsx"));
const BookDetails = lazy(() => import("../pages/public/BookDetails.jsx"));
const CategoryPage = lazy(() => import("../pages/public/CategoryPage.jsx"));
const AuthorPage = lazy(() => import("../pages/public/AuthorPage.jsx"));
const PublisherPage = lazy(() => import("../pages/public/PublisherPage.jsx"));
const SearchResults = lazy(() => import("../pages/public/SearchResults.jsx"));
const Privacy = lazy(() => import("../pages/public/Privacy.jsx"));
const Terms = lazy(() => import("../pages/public/Terms.jsx"));
const Contact = lazy(() => import("../pages/public/Contact.jsx"));
const NotFound = lazy(() => import("../pages/public/NotFound.jsx"));

// auth pages
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail.jsx"));

// customer pages
const Profile = lazy(() => import("../pages/customer/Profile.jsx"));
const Cart = lazy(() => import("../pages/customer/Cart.jsx"));
const Checkout = lazy(() => import("../pages/customer/Checkout.jsx"));
const Orders = lazy(() => import("../pages/customer/Orders.jsx"));
const OrderDetails = lazy(() => import("../pages/customer/OrderDetails.jsx"));
const OrderTracking = lazy(() => import("../pages/customer/OrderTracking.jsx"));
const CustomerDashboard = lazy(() => import("../pages/customer/CustomerDashboard.jsx"));
const NotificationPreferences = lazy(() => import("../pages/customer/NotificationPreferences.jsx"));
const Wishlist = lazy(() => import("../pages/customer/Wishlist.jsx"));
const Addresses = lazy(() => import("../pages/customer/Addresses.jsx"));
const ChatFullPage = lazy(() => import("../pages/chatbot/ChatFullPage.jsx"));
const PaymentSuccess = lazy(() => import("../pages/customer/PaymentSuccess.jsx"));
const PaymentCancelled = lazy(() => import("../pages/customer/PaymentCancelled.jsx"));

// admin pages
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard.jsx"));
const AdminUsers = lazy(() => import("../pages/admin/Users.jsx"));
const AdminBooks = lazy(() => import("../pages/admin/Books.jsx"));
const AdminCategories = lazy(() => import("../pages/admin/Categories.jsx"));
const AdminAuthors = lazy(() => import("../pages/admin/Authors.jsx"));
const AdminPublishers = lazy(() => import("../pages/admin/Publishers.jsx"));
const AdminOrders = lazy(() => import("../pages/admin/Orders.jsx"));
const AdminInventory = lazy(() => import("../pages/admin/Inventory.jsx"));
const AdminReviews = lazy(() => import("../pages/admin/Reviews.jsx"));
const AdminCoupons = lazy(() => import("../pages/admin/Coupons.jsx"));
const AdminAnalytics = lazy(() => import("../pages/admin/Analytics.jsx"));
const AdminRecommendations = lazy(() => import("../pages/admin/Recommendations.jsx"));
const AdminAIAssistant = lazy(() => import("../pages/admin/AIAssistant.jsx"));

// AI pages
const SemanticSearch = lazy(() => import("../ai/pages/SemanticSearch.jsx"));
const TrendingBooksPage = lazy(() => import("../ai/pages/TrendingBooks.jsx"));
const RecommendedForYou = lazy(() => import("../ai/pages/RecommendedForYou.jsx"));

// admin layout (lazy because only admins use it)
const AdminLayout = lazy(() => import("../components/layout/AdminLayout.jsx"));

export default function AppRouter() {
  return (
    <SuspenseWrapper>
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
        <Route path="/trending" element={<TrendingBooksPage />} />
        <Route path="/recommended" element={<RecommendedForYou />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

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
    </SuspenseWrapper>
  );
}
