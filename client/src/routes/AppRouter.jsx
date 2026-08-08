/**
 * routes/AppRouter.jsx — root route table.
 *   /                       Home
 *   /books                  catalog
 *   /books/:id              BookDetails
 *   /search                 search results (keyword/semantic)
 *   /categories/:id         category page
 *   /authors/:id            author page
 *   /publishers/:id         publisher page
 *   /login, /register, /forgot-password, /reset-password
 *   /cart, /checkout        ProtectedRoute
 *   /orders, /orders/:id    ProtectedRoute
 *   /wishlist               ProtectedRoute
 *   /profile                ProtectedRoute
 *   /admin/*                AdminRoute
 *   /chat                   full-page chatbot
 */
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";

// public pages
import Home from "../pages/public/Home.jsx";
import Books from "../pages/public/Books.jsx";
import BookDetails from "../pages/public/BookDetails.jsx";
import SearchResults from "../pages/public/SearchResults.jsx";
import CategoryPage from "../pages/public/CategoryPage.jsx";
import AuthorPage from "../pages/public/AuthorPage.jsx";
import PublisherPage from "../pages/public/PublisherPage.jsx";
import NotFound from "../pages/public/NotFound.jsx";

// auth pages
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import VerifyEmail from "../pages/auth/VerifyEmail.jsx";

// customer pages
import Cart from "../pages/customer/Cart.jsx";
import Checkout from "../pages/customer/Checkout.jsx";
import Orders from "../pages/customer/Orders.jsx";
import OrderDetails from "../pages/customer/OrderDetails.jsx";
import Wishlist from "../pages/customer/Wishlist.jsx";
import Profile from "../pages/customer/Profile.jsx";
import Addresses from "../pages/customer/Addresses.jsx";

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
import AdminAIAssistant from "../pages/admin/AIAssistant.jsx";

// chatbot full-page
import ChatFullPage from "../pages/chatbot/ChatFullPage.jsx";

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

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* Customer (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/addresses" element={<Addresses />} />
        <Route path="/chat" element={<ChatFullPage />} />
      </Route>

      {/* Admin (admin-only) */}
      <Route element={<AdminRoute />}>
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
        <Route path="/admin/ai" element={<AdminAIAssistant />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}