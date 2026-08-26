/**
 * controllers/recommendationAdminController.js — admin endpoints for
 * recommendation management: embedding status, logs, analytics, regeneration.
 */
import catchAsync from "../utils/catchAsync.js";
import pick from "../utils/pick.js";
import recommendationAdminService from "../services/recommendationAdminService.js";

const getSummary = catchAsync(async (_req, res) => {
  res.json(await recommendationAdminService.getSummary());
});

const embeddingStatus = catchAsync(async (req, res) => {
  const query = pick(req.query, ["page", "limit", "search", "hasEmbedding"]);
  res.json(await recommendationAdminService.embeddingStatus(query));
});

const getMostRecommended = catchAsync(async (req, res) => {
  const query = pick(req.query, ["page", "limit", "days"]);
  res.json(await recommendationAdminService.getMostRecommended(query));
});

const getMostClicked = catchAsync(async (req, res) => {
  const query = pick(req.query, ["page", "limit", "days"]);
  res.json(await recommendationAdminService.getMostClicked(query));
});

const listLogs = catchAsync(async (req, res) => {
  const query = pick(req.query, ["page", "limit", "userId", "bookId", "reason", "days"]);
  res.json(await recommendationAdminService.listLogs(query));
});

const regenerateEmbeddings = catchAsync(async (req, res) => {
  res.json(await recommendationAdminService.regenerateEmbeddings(req.body.bookIds));
});

export {
  getSummary,
  embeddingStatus,
  getMostRecommended,
  getMostClicked,
  listLogs,
  regenerateEmbeddings,
};
