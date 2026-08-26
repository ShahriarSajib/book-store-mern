/**
 * controllers/authController.js — HTTP layer for auth.
 * Delegates to authService.
 */
import catchAsync from "../utils/catchAsync.js";
import * as authService from "../services/authService.js";

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  res.json(result);
});

const logout = catchAsync(async (req, res) => {
  const result = await authService.logout(req.body.refreshToken);
  res.json(result);
});

const verifyEmail = catchAsync(async (req, res) => {
  const result = await authService.verifyEmail(req.params.token);
  res.json(result);
});

const resendVerification = catchAsync(async (req, res) => {
  const result = await authService.resendVerification(req.body.email);
  res.json(result);
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(result);
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.json(result);
});

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ user });
});

const updateMe = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ user });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.password
  );
  res.json(result);
});

export {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
};
