const prisma = require("../../config/prisma");
const { recordAudit } = require("../../services/audit.service");

const ROLES = ["EMPLOYEE", "MANAGER", "HR_ADMIN", "SUPER_ADMIN"];

async function listUsers(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 25, 1), 50);
  const q = req.query.q;

  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true,
        jobTitle: true,
        salaryMonthly: true,
        createdAt: true,
      },
      orderBy: [{ firstName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json({ total, page, pageSize, users });
}

async function updateRole(req, res) {
  const { role } = req.body;
  if (!ROLES.includes(role)) return res.status(400).json({ error: "Invalid role" });

  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.user.update({ where: { id: target.id }, data: { role } });

  await recordAudit({
    userId: req.user.id,
    action: "ROLE_CHANGE",
    detail: `${target.email}: ${target.role} -> ${role}`,
    ipAddress: req.ip,
  });

  res.json({ id: updated.id, email: updated.email, role: updated.role });
}

const ADMIN_EDITABLE_FIELDS = ["department", "jobTitle", "managerId", "salaryMonthly", "bankName", "bankAccountNo"];

async function updateUser(req, res) {
  const data = {};
  for (const field of ADMIN_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const updated = await prisma.user.update({ where: { id: req.params.id }, data });
  await recordAudit({
    userId: req.user.id,
    action: "USER_UPDATED",
    detail: `${updated.email}: ${Object.keys(data).join(", ")}`,
    ipAddress: req.ip,
  });

  const { passwordHash, ...safe } = updated;
  res.json(safe);
}

module.exports = { listUsers, updateRole, updateUser };
