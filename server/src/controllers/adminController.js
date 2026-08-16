/**
 * controllers/adminController.js — admin dashboard, user mgmt, CRUD summary,
 * inventory, reviews, coupons, orders, analytics, and AI assistant.
 */
const catchAsync = require("../utils/catchAsync");
const adminService = require("../services/adminService");
const inventoryService = require("../services/inventoryService");
const pick = require("../utils/pick");

const getDashboard = catchAsync(async (_req, res) => {
  res.json(await adminService.getDashboard());
});

const listUsers = catchAsync(async (req, res) => {
  const query = pick(req.query, ["page", "limit", "search", "role", "status"]);
  res.json(await adminService.listUsers(query));
});

const getUser = catchAsync(async (req, res) => {
  res.json({ user: await adminService.getUserById(req.params.id) });
});

const updateUser = catchAsync(async (req, res) => {
  res.json({ user: await adminService.updateUser(req.params.id, req.body) });
});

const deleteUser = catchAsync(async (req, res) => {
  res.json(await adminService.deleteUser(req.params.id));
});

// ---- Inventory ----
const listInventory = catchAsync(async (_req, res) => {
  res.json(await inventoryService.list());
});

const updateStock = catchAsync(async (req, res) => {
  res.json(await inventoryService.updateStock(req.params.id, req.body.stock));
});

// ---- Reviews ----
const listReviews = catchAsync(async (req, res) => {
  const reviewService = require("../services/reviewService");
  res.json(await reviewService.listAll(req.query));
});

const updateReview = catchAsync(async (req, res) => {
  const reviewService = require("../services/reviewService");
  res.json({ review: await reviewService.adminUpdate(req.params.id, req.body) });
});

const deleteReview = catchAsync(async (req, res) => {
  const reviewService = require("../services/reviewService");
  res.json(await reviewService.adminRemove(req.params.id));
});

// ---- Coupons ----
const listCoupons = catchAsync(async (_req, res) => {
  const couponService = require("../services/couponService");
  res.json({ coupons: await couponService.listAdmin() });
});

const createCoupon = catchAsync(async (req, res) => {
  const couponService = require("../services/couponService");
  res.status(201).json({ coupon: await couponService.create(req.body) });
});

const updateCoupon = catchAsync(async (req, res) => {
  const couponService = require("../services/couponService");
  res.json({ coupon: await couponService.update(req.params.id, req.body) });
});

const deleteCoupon = catchAsync(async (req, res) => {
  const couponService = require("../services/couponService");
  res.json(await couponService.remove(req.params.id));
});

// ---- Orders ----
const listOrders = catchAsync(async (req, res) => {
  const orderService = require("../services/orderService");
  res.json(await orderService.listAll(req.query));
});

const updateOrder = catchAsync(async (req, res) => {
  const orderService = require("../services/orderService");
  res.json({ order: await orderService.updateStatus(req.params.id, req.body) });
});

// ---- Analytics ----
const analyticsSales = catchAsync(async (req, res) => {
  const analyticsService = require("../services/analyticsService");
  res.json(await analyticsService.salesReport(req.query));
});

const analyticsInventory = catchAsync(async (_req, res) => {
  const analyticsService = require("../services/analyticsService");
  res.json(await analyticsService.inventoryReport());
});

const analyticsRecommendations = catchAsync(async (_req, res) => {
  const analyticsService = require("../services/analyticsService");
  res.json(await analyticsService.recommendationReport());
});

// ---- AI Assistant (admin) ----
const aiChat = catchAsync(async (req, res) => {
  const chatbotService = require("../services/chatbotService");
  res.json(await chatbotService.sendMessage(req.user.id, req.body));
});

module.exports = {
  getDashboard,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  listInventory,
  updateStock,
  listReviews,
  updateReview,
  deleteReview,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listOrders,
  updateOrder,
  analyticsSales,
  analyticsInventory,
  analyticsRecommendations,
  aiChat,
};
