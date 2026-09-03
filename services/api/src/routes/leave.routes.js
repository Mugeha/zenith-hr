const express = require("express");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/leave.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/me", ctrl.myLeave);
router.post("/", ctrl.createLeaveRequest);
router.get("/team", requireRole("MANAGER", "HR_ADMIN", "SUPER_ADMIN"), ctrl.teamLeave);
router.patch("/:id/decision", requireRole("MANAGER", "HR_ADMIN", "SUPER_ADMIN"), ctrl.decideLeaveRequest);

module.exports = router;
