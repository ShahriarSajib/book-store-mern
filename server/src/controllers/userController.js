/**
 * controllers/userController.js — profile, addresses, password change.
 */
const catchAsync = require("../utils/catchAsync");
const userService = require("../services/userService");
const authService = require("../services/authService");

const getMe = catchAsync(async (req, res) => {
  res.json({ user: await userService.getProfile(req.user.id) });
});

const updateMe = catchAsync(async (req, res) => {
  res.json({ user: await userService.updateProfile(req.user.id, req.body) });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.password
  );
  res.json(result);
});

const getAddresses = catchAsync(async (req, res) => {
  res.json({ addresses: await userService.listAddresses(req.user.id) });
});

const addAddress = catchAsync(async (req, res) => {
  res.status(201).json({ addresses: await userService.addAddress(req.user.id, req.body) });
});

const updateAddress = catchAsync(async (req, res) => {
  res.json({ addresses: await userService.updateAddress(req.user.id, req.params.id, req.body) });
});

const deleteAddress = catchAsync(async (req, res) => {
  res.json({ addresses: await userService.deleteAddress(req.user.id, req.params.id) });
});

const getHistory = catchAsync(async (req, res) => {
  res.json(await userService.getHistory(req.user.id));
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getHistory,
};
