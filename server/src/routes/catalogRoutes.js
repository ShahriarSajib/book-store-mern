/**
 * routes/catalogRoutes.js — /api/categories, /api/authors, /api/publishers
 *   Public: GET /, GET /:id
 *   Admin:  POST /, PUT /:id, DELETE /:id
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const ctrl = require("../controllers/catalogController");

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);

router.post("/", protect, requireAdmin, ctrl.create);
router.put("/:id", protect, requireAdmin, ctrl.update);
router.delete("/:id", protect, requireAdmin, ctrl.remove);

module.exports = router;
