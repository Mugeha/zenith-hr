const express = require("express");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/reviews.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/received", ctrl.received);
router.get("/written", requireRole("MANAGER", "HR_ADMIN", "SUPER_ADMIN"), ctrl.written);
router.post("/", requireRole("MANAGER", "HR_ADMIN", "SUPER_ADMIN"), ctrl.createReview);
router.patch("/:id/acknowledge", ctrl.acknowledge);

module.exports = router;
