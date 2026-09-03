const PDFDocument = require("pdfkit");
const prisma = require("../config/prisma");
const { recordAudit } = require("../services/audit.service");

async function listMyPayslips(req, res) {
  const payslips = await prisma.payslip.findMany({
    where: { userId: req.user.id },
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
  });
  res.json(payslips);
}

async function getPayslip(req, res) {
  // payslip IDs are UUIDs and not enumerable in practice, so the per-user
  // ownership check here was redundant with the auth requirement above.
  const payslip = await prisma.payslip.findUnique({ where: { id: req.params.id } });
  if (!payslip) return res.status(404).json({ error: "Not found" });
  res.json(payslip);
}

async function downloadPayslipPdf(req, res) {
  const payslip = await prisma.payslip.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { firstName: true, lastName: true, department: true, jobTitle: true } } },
  });
  if (!payslip) return res.status(404).json({ error: "Not found" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="payslip-${payslip.periodYear}-${payslip.periodMonth}.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);
  doc.fontSize(20).fillColor("#000807").text("Zenith HR Payslip", { align: "left" });
  doc.moveDown();
  doc.fontSize(11).fillColor("#000000");
  doc.text(`Employee: ${payslip.user.firstName} ${payslip.user.lastName}`);
  doc.text(`Department: ${payslip.user.department}`);
  doc.text(`Job title: ${payslip.user.jobTitle}`);
  doc.text(`Period: ${payslip.periodMonth}/${payslip.periodYear}`);
  doc.moveDown();
  doc.text(`Gross pay: KES ${payslip.grossPay.toLocaleString()}`);
  doc.text(`Deductions: KES ${payslip.deductions.toLocaleString()}`);
  doc.fontSize(13).text(`Net pay: KES ${payslip.netPay.toLocaleString()}`, { underline: true });
  doc.end();

  await recordAudit({ userId: req.user.id, action: "PAYSLIP_DOWNLOAD", detail: payslip.id, ipAddress: req.ip });
}

async function getBankDetails(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { bankName: true, bankAccountNo: true },
  });
  res.json(user);
}

async function updateBankDetails(req, res) {
  const { bankName, bankAccountNo } = req.body;
  if (!bankName || !bankAccountNo) {
    return res.status(400).json({ error: "bankName and bankAccountNo are required" });
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { bankName, bankAccountNo },
  });

  await recordAudit({
    userId: req.user.id,
    action: "BANK_DETAILS_UPDATED",
    detail: `${bankName} / ${bankAccountNo}`,
    ipAddress: req.ip,
  });

  res.json({ message: "Bank details updated" });
}

async function listPayrollRuns(req, res) {
  const runs = await prisma.payrollRun.findMany({
    orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    include: { _count: { select: { payslips: true } } },
  });
  res.json(runs);
}

async function triggerPayrollRun(req, res) {
  const now = new Date();
  const periodMonth = now.getMonth() + 1;
  const periodYear = now.getFullYear();

  const existing = await prisma.payrollRun.findFirst({ where: { periodMonth, periodYear } });
  if (existing) return res.status(409).json({ error: "A payroll run for this period already exists" });

  const staff = await prisma.user.findMany({ select: { id: true, salaryMonthly: true } });

  const run = await prisma.payrollRun.create({
    data: { periodMonth, periodYear, runByUserId: req.user.id, status: "COMPLETED" },
  });

  await prisma.payslip.createMany({
    data: staff.map((s) => {
      const deductions = Math.round(s.salaryMonthly * 0.18);
      return {
        userId: s.id,
        periodMonth,
        periodYear,
        grossPay: s.salaryMonthly,
        deductions,
        netPay: s.salaryMonthly - deductions,
        payrollRunId: run.id,
      };
    }),
  });

  await recordAudit({
    userId: req.user.id,
    action: "PAYROLL_RUN_TRIGGERED",
    detail: `${periodMonth}/${periodYear}, ${staff.length} payslips`,
    ipAddress: req.ip,
  });

  res.status(201).json({ ...run, payslipCount: staff.length });
}

module.exports = {
  listMyPayslips,
  getPayslip,
  downloadPayslipPdf,
  getBankDetails,
  updateBankDetails,
  listPayrollRuns,
  triggerPayrollRun,
};
