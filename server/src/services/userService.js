/**
 * services/userService.js — profile, addresses, dashboard, wishlist mutations.
 */
const AppError = require("../utils/AppError");
const { User, Order, Wishlist, Review } = require("../models");

async function getProfile(userId) {
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

async function listAddresses(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  return user.addresses || [];
}

async function addAddress(userId, address) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  if (address.isDefault || user.addresses.length === 0) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
    address.isDefault = true;
  }
  user.addresses.push(address);
  await user.save();
  return user.addresses;
}

async function updateAddress(userId, addressId, patch) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  const address = user.addresses.id(addressId);
  if (!address) {
    throw new AppError("Address not found", 404, "NOT_FOUND");
  }
  if (patch.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }
  Object.assign(address, patch);
  await user.save();
  return user.addresses;
}

async function deleteAddress(userId, addressId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  const address = user.addresses.id(addressId);
  if (!address) {
    throw new AppError("Address not found", 404, "NOT_FOUND");
  }
  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }
  await user.save();
  return user.addresses;
}

async function getHistory(userId) {
  const user = await User.findById(userId).populate({
    path: "browseHistory",
    select: "title coverImage price slug",
  });
  if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }
  return {
    browseHistory: user.browseHistory || [],
    searchHistory: user.searchHistory || [],
  };
}

async function getDashboard(userId) {
  const [totalOrders, completedOrders, pendingOrders, cancelledOrders, wishlist, reviewsGiven, recentOrders] =
    await Promise.all([
      Order.countDocuments({ user: userId }),
      Order.countDocuments({ user: userId, status: "delivered" }),
      Order.countDocuments({ user: userId, status: "pending" }),
      Order.countDocuments({ user: userId, status: "cancelled" }),
      Wishlist.countDocuments({ user: userId }),
      Review.countDocuments({ user: userId }),
      Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select("orderNumber status total createdAt items"),
    ]);

  const [totalSpent] = await Order.aggregate([
    { $match: { user: userId, status: { $ne: "cancelled" } } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  return {
    stats: {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      wishlistCount: wishlist,
      reviewsGiven,
      totalSpent: totalSpent?.total || 0,
    },
    recentOrders,
  };
}

module.exports = {
  getProfile,
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getHistory,
  getDashboard,
};
