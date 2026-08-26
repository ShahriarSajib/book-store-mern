/**
 * jobs/expiringCoupons.js
 * Responsibility: deactivate coupons whose expiry date has passed so they
 * can no longer be applied at checkout or by the chatbot.
 */
import Coupon from "../models/Coupon.js";
import logger from "../utils/logger.js";

async function run() {
  const now = new Date();

  const result = await Coupon.updateMany(
    {
      isActive: true,
      expiresAt: { $ne: null, $lt: now },
    },
    { $set: { isActive: false } }
  );

  if (result.modifiedCount > 0) {
    logger.info(`[job:expiringCoupons] deactivated ${result.modifiedCount} expired coupon(s)`);
  } else {
    logger.debug("[job:expiringCoupons] no expired coupons");
  }

  return { deactivated: result.modifiedCount };
}

export { run };
