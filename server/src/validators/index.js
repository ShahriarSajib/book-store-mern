/**
 * validators/index.js — aggregate validator exports.
 */
module.exports = {
  authValidators: require("./authValidators"),
  userValidators: require("./userValidators"),
  bookValidators: require("./bookValidators"),
  cartValidators: require("./cartValidators"),
  orderValidators: require("./orderValidators"),
  reviewValidators: require("./reviewValidators"),
  couponValidators: require("./couponValidators"),
};
