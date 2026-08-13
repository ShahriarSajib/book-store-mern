/**
 * services/authService.js — register/login/refresh/verifyEmail/resetPassword.
 */
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const { User } = require("../models");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const emailUtil = require("../utils/email");
const env = require("../config/env");

const FRONTEND_URL = env.CLIENT_URL || "http://localhost:5173";

function isDev() {
  return env.NODE_ENV !== "production";
}

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function issueTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409, "EMAIL_TAKEN");
  }

  const user = new User({ name, email, password });
  const verificationToken = user.createEmailVerificationToken();
  await user.save();

  const verifyUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;
  const mail = emailUtil.verificationEmail(user.name, verifyUrl);
  await emailUtil.sendEmail({ to: user.email, ...mail });

  return {
    user: user.toPublicJSON(),
    message: "Account created. Please verify your email to continue.",
    ...(isDev() ? { verificationLink: verifyUrl } : {}),
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
  if (!user.isActive) {
    throw new AppError("Your account has been disabled. Contact support.", 403, "ACCOUNT_DISABLED");
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: user.toPublicJSON(),
    ...issueTokens(user),
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400, "REFRESH_TOKEN_REQUIRED");
  }
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new AppError("User account no longer active", 401, "INVALID_REFRESH_TOKEN");
  }
  return issueTokens(user);
}

async function logout(_refreshToken) {
  // Stateless JWT auth — client drops tokens. Future-proof for token blacklists.
  return { success: true };
}

async function verifyEmail(rawToken) {
  const hashed = hashToken(rawToken);
  const user = await User.findOne({ emailVerificationToken: hashed }).select("+emailVerificationToken +emailVerificationExpires");
  if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
    throw new AppError("Verification link is invalid or has expired", 400, "INVALID_VERIFICATION_TOKEN");
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  return { message: "Email verified successfully. You can now log in." };
}

async function resendVerification(email) {
  const user = await User.findOne({ email });
  if (!user) return { message: "If an account exists, a verification link has been sent." };
  if (user.isEmailVerified) {
    throw new AppError("This email is already verified", 400, "ALREADY_VERIFIED");
  }
  const token = user.createEmailVerificationToken();
  await user.save();
  const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;
  const mail = emailUtil.verificationEmail(user.name, verifyUrl);
  await emailUtil.sendEmail({ to: user.email, ...mail });
  return {
    message: "Verification email sent.",
    ...(isDev() ? { verificationLink: verifyUrl } : {}),
  };
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) {
    return { message: "If an account exists with that email, a reset link has been sent." };
  }
  const token = user.createPasswordResetToken();
  await user.save();
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const mail = emailUtil.passwordResetEmail(user.name, resetUrl);
  await emailUtil.sendEmail({ to: user.email, ...mail });
  return {
    message: "If an account exists with that email, a reset link has been sent.",
    ...(isDev() ? { resetLink: resetUrl } : {}),
  };
}

async function resetPassword(rawToken, newPassword) {
  const hashed = hashToken(rawToken);
  const user = await User.findOne({ passwordResetToken: hashed }).select("+password +passwordResetToken +passwordResetExpires");
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < Date.now()) {
    throw new AppError("Reset link is invalid or has expired", 400, "INVALID_RESET_TOKEN");
  }
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return { message: "Password reset successful. You can now log in." };
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  return user.toPublicJSON();
}

async function updateProfile(userId, data) {
  const allowed = ["name", "phone", "bio", "avatar", "favoriteGenres"];
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  allowed.forEach((field) => {
    if (data[field] !== undefined) user[field] = data[field];
  });
  await user.save();
  return user.toPublicJSON();
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  const ok = await user.comparePassword(currentPassword);
  if (!ok) {
    throw new AppError("Current password is incorrect", 400, "WRONG_PASSWORD");
  }
  user.password = newPassword;
  await user.save();
  return { message: "Password updated successfully. Please log in again." };
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
};
