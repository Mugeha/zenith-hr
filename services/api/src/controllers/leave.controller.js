const prisma = require("../config/prisma");
const { recordAudit } = require("../services/audit.service");

async function myLeave(req, res) {
  const [requests, balance] = await Promise.all([
    prisma.leaveRequest.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } }),
    prisma.leaveBalance.findUnique({ where: { userId: req.user.id } }),
  ]);
  res.json({ requests, balance });
}

async function createLeaveRequest(req, res) {
  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate || !reason) {
    return res.status(400).json({ error: "startDate, endDate, and reason are required" });
  }

  const requester = await prisma.user.findUnique({ where: { id: req.user.id } });
  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      userId: req.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      approverId: requester.managerId,
    },
  });

  res.status(201).json(leaveRequest);
}

async function teamLeave(req, res) {
  const reports = await prisma.user.findMany({ where: { managerId: req.user.id }, select: { id: true } });
  const reportIds = reports.map((r) => r.id);

  const where =
    req.user.role === "HR_ADMIN" || req.user.role === "SUPER_ADMIN"
      ? {}
      : { userId: { in: reportIds } };

  const requests = await prisma.leaveRequest.findMany({
    where,
    include: { user: { select: { firstName: true, lastName: true, department: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(requests);
}

async function decideLeaveRequest(req, res) {
  const { decision } = req.body; // "APPROVED" | "REJECTED"
  if (!["APPROVED", "REJECTED"].includes(decision)) {
    return res.status(400).json({ error: "decision must be APPROVED or REJECTED" });
  }

  const leaveRequest = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
  if (!leaveRequest) return res.status(404).json({ error: "Not found" });

  const isAssignedApprover = leaveRequest.approverId === req.user.id;
  const isHrOverride = req.user.role === "HR_ADMIN" || req.user.role === "SUPER_ADMIN";
  if (!isAssignedApprover && !isHrOverride) return res.status(403).json({ error: "Forbidden" });

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveRequest.id },
    data: { status: decision, approverId: req.user.id },
  });

  if (decision === "APPROVED") {
    const days = Math.round((leaveRequest.endDate - leaveRequest.startDate) / 86400000) + 1;
    await prisma.leaveBalance.update({
      where: { userId: leaveRequest.userId },
      data: { usedDays: { increment: Math.max(days, 1) } },
    });
  }

  await recordAudit({
    userId: req.user.id,
    action: "LEAVE_DECISION",
    detail: `${leaveRequest.id} -> ${decision}`,
    ipAddress: req.ip,
  });

  res.json(updated);
}

module.exports = { myLeave, createLeaveRequest, teamLeave, decideLeaveRequest };
