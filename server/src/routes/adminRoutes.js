/**
 * routes/adminRoutes.js — /api/admin/*
 *   /dashboard, /users (admin-only user management).
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const ctrl = require("../controllers/adminController");

router.use(protect, requireAdmin);

router.get("/dashboard", ctrl.getDashboard);

router.get("/users", ctrl.listUsers);
router.get("/users/:id", ctrl.getUser);
router.put("/users/:id", ctrl.updateUser);
router.delete("/users/:id", ctrl.deleteUser);

module.exports = router;
