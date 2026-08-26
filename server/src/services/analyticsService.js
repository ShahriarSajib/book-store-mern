/**
 * services/analyticsService.js — admin dashboard metrics, sales reports,
 * recommendation analytics.
 */
import { Order, Book, Review, User } from "../models/index.js";

async function salesReport(query = {}) {
  const days = Math.max(1, Math.min(365, Number(query.days) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const groupBy = query.groupBy === "day" ? "day" : query.groupBy === "month" ? "month" : "day";

  const dateProject = groupBy === "month" ? { $month: "$createdAt" } : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

  const [summary, series, topBooks, statusBreakdown] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 }, items: { $sum: { $size: "$items" } } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
      { $group: { _id: dateProject, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 366 },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.title", revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, qty: { $sum: "$items.quantity" } } },
      { $sort: { qty: -1 } },
      { $limit: 10 },
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  return {
    summary: summary[0] || { revenue: 0, orders: 0, items: 0 },
    series,
    topBooks,
    statusBreakdown,
  };
}

async function inventoryReport() {
  const [lowStock, outOfStock, totals] = await Promise.all([
    Book.find({ stock: { $gt: 0, $lte: 10 } }).select("title price stock coverImage").sort({ stock: 1 }).limit(50),
    Book.countDocuments({ stock: { $lte: 0 } }),
    Book.aggregate([
      { $group: { _id: null, books: { $sum: 1 }, totalStock: { $sum: "$stock" }, value: { $sum: { $multiply: ["$stock", "$price"] } } } },
    ]),
  ]);
  return {
    lowStock,
    outOfStock,
    totals: totals[0] || { books: 0, totalStock: 0, value: 0 },
  };
}

async function recommendationReport() {
  const [topRated, mostPurchased, reviewStats] = await Promise.all([
    Book.find({ ratingsCount: { $gt: 0 } }).sort({ averageRating: -1, ratingsCount: -1 }).select("title averageRating ratingsCount coverImage").limit(10),
    Book.find({ purchaseCount: { $gt: 0 } }).sort({ purchaseCount: -1 }).select("title purchaseCount price coverImage").limit(10),
    Review.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);
  return {
    topRated,
    mostPurchased,
    reviewStats: reviewStats[0] || { avg: 0, count: 0 },
  };
}

async function summary() {
  const [orders, revenue, users, reviews] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    User.countDocuments(),
    Review.countDocuments(),
  ]);
  return {
    orders,
    revenue: revenue[0]?.total || 0,
    users,
    reviews,
  };
}

export { salesReport, inventoryReport, recommendationReport, summary };
