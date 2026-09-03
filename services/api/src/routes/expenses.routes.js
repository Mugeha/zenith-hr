const express = require("express");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { uploader } = require("../middleware/upload");
const ctrl = require("../controllers/expenses.controller");

const router = express.Router();
router.use(requireAuth);

const receiptUpload = uploader("receipts");

router.get("/me", ctrl.myExpenses);
router.post("/", receiptUpload.single("receipt"), ctrl.createExpense);
router.get("/approvals", requireRole("MANAGER", "HR_ADMIN", "SUPER_ADMIN"), ctrl.pendingApprovals);
router.patch("/:id/decision", requireRole("MANAGER", "HR_ADMIN", "SUPER_ADMIN"), ctrl.decideExpense);

module.exports = router;
