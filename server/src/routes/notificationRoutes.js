/**
 * routes/notificationRoutes.js — /api/notifications/*
 *   GET /, POST /:id/read, POST /read-all, DELETE /:id, DELETE / (clear)
 *   GET /preferences, PUT /preferences
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/notificationController");

router.use(protect);

router.get("/", ctrl.list);
router.post("/:id/read", ctrl.markAsRead);
router.post("/read-all", ctrl.markAllAsRead);
router.delete("/:id", ctrl.remove);
router.delete("/", ctrl.clearAll);

router.get("/preferences", ctrl.getPreferences);
router.put("/preferences", ctrl.updatePreferences);

module.exports = router;
