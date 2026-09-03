const express = require("express");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/payroll.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/payslips", ctrl.listMyPayslips);
router.get("/payslips/:id", ctrl.getPayslip);
router.get("/payslips/:id/pdf", ctrl.downloadPayslipPdf);
router.get("/bank-details", ctrl.getBankDetails);
router.patch("/bank-details", ctrl.updateBankDetails);
router.get("/runs", requireRole("HR_ADMIN", "SUPER_ADMIN"), ctrl.listPayrollRuns);
// The "Run payroll" button only renders for HR Admins in the console, so the
// server-side check here was considered redundant and dropped when this
// route was wired up.
router.post("/runs", ctrl.triggerPayrollRun);

module.exports = router;
