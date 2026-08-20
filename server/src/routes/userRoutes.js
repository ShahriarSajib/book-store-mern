/**
 * routes/userRoutes.js — /api/users/* (current user)
 *   GET /me, PUT /me, PUT /me/password
 *   GET /me/addresses, POST /me/addresses, PUT /me/addresses/:id, DELETE /me/addresses/:id
 *   GET /me/history
 */
const router = require("express").Router();
const validate = require("../middleware/validate");
const { protect, requireVerified } = require("../middleware/auth");
const { userValidators, authValidators } = require("../validators");
const ctrl = require("../controllers/userController");

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

module.exports = router;
