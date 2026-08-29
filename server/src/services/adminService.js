/**
 * services/adminService.js — admin dashboard + user management.
 */
import AppError from "../utils/AppError.js";
import { User, Book, Order, Category, Author, Publisher } from "../models/index.js";
import { getPagination, buildPageMeta } from "../utils/paginate.js";

function safeCount(Model, filter = {}) {
  return typeof Model === "function" && typeof Model.countDocuments === "function"
    ? Model.countDocuments(filter)
    : Promise.resolve(null);
}

const DASHBOARD_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
let dashboardCache = null;
let dashboardCacheLoadedAt = 0;
let dashboardLoadingPromise = null;

async function getDashboard({ force = false } = {}) {
  const now = Date.now();

  if (!force && dashboardCache && now - dashboardCacheLoadedAt < DASHBOARD_CACHE_TTL_MS) {
    return dashboardCache;
  }

  if (!dashboardLoadingPromise) {
    dashboardLoadingPromise = loadDashboard()
      .then((value) => {
        dashboardCache = value;
        dashboardCacheLoadedAt = Date.now();
        return value;
      })
      .finally(() => {
        dashboardLoadingPromise = null;
      });
  }

  return dashboardLoadingPromise;
}

async function loadDashboard() {
  const [users, activeUsers, books, categories, authors, publishers, orders, pendingOrders] =
    await Promise.all([
      safeCount(User),
      safeCount(User, { isActive: true }),
      safeCount(Book),
      safeCount(Category),
      safeCount(Author),
      safeCount(Publisher),
      safeCount(Order),
      safeCount(Order, { status: "pending" }),
    ]);

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email role isActive createdAt");

  let revenue = null;
  if (typeof Order === "function" && typeof Order.aggregate === "function") {
    const [agg] = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    revenue = agg ? agg.total : 0;
  }

  return {
    stats: {
      users,
      activeUsers,
      books,
      categories,
      authors,
      publishers,
      orders,
      pendingOrders,
      revenue,
    },
    recentUsers,
  };
}

async function listUsers({ page, limit, search, role, status }) {
  const filter = {};
  if (search) {
    const rx = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (role) filter.role = role;
  if (status === "active") filter.isActive = true;
  if (status === "disabled") filter.isActive = false;

  const { skip } = getPagination({ page, limit });
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name email role isActive isEmailVerified createdAt lastLoginAt"),
  ]);
  return {
    users,
    pagination: buildPageMeta(total, Number(page) || 1, Number(limit) || 20),
  };
}

async function getUserById(userId) {
  const user = await User.findById(userId).select("name email role isActive isEmailVerified phone createdAt lastLoginAt");
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  return user;
}

async function updateUser(userId, patch) {
  const allowed = ["role", "isActive", "isEmailVerified", "name", "phone"];
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  allowed.forEach((field) => {
    if (patch[field] !== undefined) user[field] = patch[field];
  });
  await user.save();
  return user;
}

async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  return { success: true };
}

export {
  getDashboard,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
