/**
 * controllers/analyticsController.js — admin analytics endpoints.
 */
const catchAsync = require("../utils/catchAsync");
const analyticsService = require("../services/analyticsService");

const sales = catchAsync(async (req, res) => {
  res.json(await analyticsService.salesReport(req.query));
});

const inventory = catchAsync(async (_req, res) => {
  res.json(await analyticsService.inventoryReport());
});

const recommendations = catchAsync(async (_req, res) => {
  res.json(await analyticsService.recommendationReport());
});

module.exports = { sales, inventory, recommendations };
