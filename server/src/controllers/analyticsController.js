/**
 * controllers/analyticsController.js — admin analytics endpoints.
 */
import catchAsync from "../utils/catchAsync.js";
import * as analyticsService from "../services/analyticsService.js";

const sales = catchAsync(async (req, res) => {
  res.json(await analyticsService.salesReport(req.query));
});

const inventory = catchAsync(async (_req, res) => {
  res.json(await analyticsService.inventoryReport());
});

const recommendations = catchAsync(async (_req, res) => {
  res.json(await analyticsService.recommendationReport());
});

export { sales, inventory, recommendations };
