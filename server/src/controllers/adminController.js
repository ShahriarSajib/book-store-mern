/**
 * controllers/adminController.js — admin dashboard, user mgmt, CRUD summary,
 * inventory, reviews, coupons, orders, analytics, and AI assistant.
 */
import catchAsync from "../utils/catchAsync.js";
import * as adminService from "../services/adminService.js";
import * as inventoryService from "../services/inventoryService.js";
import pick from "../utils/pick.js";
import reviewService from "../services/reviewService.js";
import * as couponService from "../services/couponService.js";
import * as orderService from "../services/orderService.js";
import * as paymentService from "../services/paymentService.js";
import * as analyticsService from "../services/analyticsService.js";
import * as chatbotService from "../services/chatbotService.js";

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
  res.json(await reviewService.listAll(req.query));
});

const updateReview = catchAsync(async (req, res) => {
  res.json({ review: await reviewService.adminUpdate(req.params.id, req.body) });
});

const deleteReview = catchAsync(async (req, res) => {
  res.json(await reviewService.adminRemove(req.params.id));
});

// ---- Coupons ----
const listCoupons = catchAsync(async (_req, res) => {
  res.json({ coupons: await couponService.listAdmin() });
});

const createCoupon = catchAsync(async (req, res) => {
  res.status(201).json({ coupon: await couponService.create(req.body) });
});

const updateCoupon = catchAsync(async (req, res) => {
  res.json({ coupon: await couponService.update(req.params.id, req.body) });
});

const deleteCoupon = catchAsync(async (req, res) => {
  res.json(await couponService.remove(req.params.id));
});

// ---- Orders ----
const listOrders = catchAsync(async (req, res) => {
  res.json(await orderService.listAll(req.query));
});

const updateOrder = catchAsync(async (req, res) => {
  res.json({ order: await orderService.updateStatus(req.params.id, req.body) });
});

const refundOrder = catchAsync(async (req, res) => {
  const result = await paymentService.refundOrder(req.params.id, req.body.reason);
  res.json(result);
});

// ---- Analytics ----
const analyticsSales = catchAsync(async (req, res) => {
  res.json(await analyticsService.salesReport(req.query));
});

const analyticsInventory = catchAsync(async (_req, res) => {
  res.json(await analyticsService.inventoryReport());
});

const analyticsRecommendations = catchAsync(async (_req, res) => {
  res.json(await analyticsService.recommendationReport());
});

// ---- AI Assistant (admin) ----
const aiChat = catchAsync(async (req, res) => {
  res.json(await chatbotService.sendMessage(req.user.id, req.body));
});

export {
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
  refundOrder,
  analyticsSales,
  analyticsInventory,
  analyticsRecommendations,
  aiChat,
};
