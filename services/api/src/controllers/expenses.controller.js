const prisma = require("../config/prisma");
const { recordAudit } = require("../services/audit.service");

async function myExpenses(req, res) {
  const expenses = await prisma.expense.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(expenses);
}

async function createExpense(req, res) {
  const { amount, description, currency } = req.body;
  if (!amount || !description) return res.status(400).json({ error: "amount and description are required" });

  const expense = await prisma.expense.create({
    data: {
      userId: req.user.id,
      amount: parseInt(amount, 10),
      currency: currency || "KES",
      description,
      receiptPath: req.file ? req.file.filename : null,
    },
  });

  res.status(201).json(expense);
}

async function pendingApprovals(req, res) {
  const expenses = await prisma.expense.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { firstName: true, lastName: true, department: true, managerId: true } } },
    orderBy: { createdAt: "asc" },
  });

  const visible =
    req.user.role === "HR_ADMIN" || req.user.role === "SUPER_ADMIN"
      ? expenses
      : expenses.filter((e) => e.user.managerId === req.user.id);

  res.json(visible);
}

async function decideExpense(req, res) {
  const { decision } = req.body; // "APPROVED" | "REJECTED" | "REIMBURSED"
  if (!["APPROVED", "REJECTED", "REIMBURSED"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  const expense = await prisma.expense.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { managerId: true } } },
  });
  if (!expense) return res.status(404).json({ error: "Not found" });

  const isManagerOfSubmitter = expense.user.managerId === req.user.id;
  const isHrOverride = req.user.role === "HR_ADMIN" || req.user.role === "SUPER_ADMIN";
  if (!isManagerOfSubmitter && !isHrOverride) return res.status(403).json({ error: "Forbidden" });

  if (decision === "REIMBURSED") {
    // credit the payout to the employee's running reimbursed total before
    // flipping the status flag
    const submitter = await prisma.user.findUnique({ where: { id: expense.userId } });
    await prisma.user.update({
      where: { id: expense.userId },
      data: { reimbursedTotal: submitter.reimbursedTotal + expense.amount },
    });
  }

  const updated = await prisma.expense.update({ where: { id: expense.id }, data: { status: decision } });

  await recordAudit({
    userId: req.user.id,
    action: "EXPENSE_DECISION",
    detail: `${expense.id} -> ${decision}`,
    ipAddress: req.ip,
  });

  res.json(updated);
}

module.exports = { myExpenses, createExpense, pendingApprovals, decideExpense };
