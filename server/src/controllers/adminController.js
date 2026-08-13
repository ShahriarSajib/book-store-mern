/**
 * controllers/adminController.js — admin dashboard, user mgmt, CRUD summary.
 */
const catchAsync = require("../utils/catchAsync");
const adminService = require("../services/adminService");
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

module.exports = {
  getDashboard,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
};
