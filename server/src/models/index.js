/**
 * models/index.js — Single export point for all Mongoose models.
 * Keeps controllers free of cross-model import wiring.
 */
module.exports = {
  User: require("./User"),
  Book: require("./Book"),
  Category: require("./Category"),
  Author: require("./Author"),
  Publisher: require("./Publisher"),
  Cart: require("./Cart"),
  Order: require("./Order"),
  Review: require("./Review"),
  Coupon: require("./Coupon"),
  Conversation: require("./Conversation"),
  FaqDocument: require("./FaqDocument"),
  RecommendationLog: require("./RecommendationLog"),
  Notification: require("./Notification"),
  Wishlist: require("./Wishlist"),
};
