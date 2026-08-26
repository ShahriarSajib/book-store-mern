/**
 * routes/userRoutes.js — /api/users/* (current user)
 *   GET /me, PUT /me, PUT /me/password
 *   GET /me/addresses, POST /me/addresses, PUT /me/addresses/:id, DELETE /me/addresses/:id
 *   GET /me/history
 */
import { Router } from "express";
import validate from "../middleware/validate.js";
import { protect, requireVerified } from "../middleware/auth.js";
import { userValidators, authValidators } from "../validators/index.js";
import * as ctrl from "../controllers/userController.js";

const router = Router();

router.get("/me", protect, ctrl.getMe);
router.put("/me", protect, validate(authValidators.updateProfileValidators), ctrl.updateMe);
router.put("/me/password", protect, validate(authValidators.changePasswordValidators), ctrl.changePassword);

router.get("/me/addresses", protect, ctrl.getAddresses);
router.post("/me/addresses", protect, validate(userValidators.addressValidators), ctrl.addAddress);
router.put("/me/addresses/:id", protect, validate(userValidators.addressValidators), ctrl.updateAddress);
router.delete("/me/addresses/:id", protect, ctrl.deleteAddress);

router.get("/me/history", protect, ctrl.getHistory);

router.get("/me/dashboard", protect, ctrl.getDashboard);

router.get("/me/wishlist", protect, ctrl.getWishlist);
router.post("/me/wishlist", protect, requireVerified, ctrl.addWishlistItem);
router.post("/me/wishlist/:bookId/move-to-cart", protect, requireVerified, ctrl.moveWishlistToCart);
router.delete("/me/wishlist/:bookId", protect, requireVerified, ctrl.removeWishlistItem);

export default router;
