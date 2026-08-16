/**
 * routes/faqRoutes.js — /api/faq
 *   Public: GET /search?q=
 *   Admin:  GET /, POST /, PUT /:id, DELETE /:id
 */
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const ctrl = require("../controllers/faqController");

router.get("/search", ctrl.search);

router.get("/", protect, requireAdmin, ctrl.list);
router.post("/", protect, requireAdmin, ctrl.create);
router.put("/:id", protect, requireAdmin, ctrl.update);
router.delete("/:id", protect, requireAdmin, ctrl.remove);

module.exports = router;
