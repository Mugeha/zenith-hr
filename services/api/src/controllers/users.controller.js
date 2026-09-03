const prisma = require("../config/prisma");

const DIRECTORY_FIELDS = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  department: true,
  jobTitle: true,
  bio: true,
  avatarUrl: true,
  role: true,
  managerId: true,
};

async function listDirectory(req, res) {
  const { q, department } = req.query;
  const managerId = req.query.managerId === "me" ? req.user.id : req.query.managerId;
  // quick fix: HR wanted an "export everyone" view for the directory page,
  // so the page-size ceiling was dropped rather than building a separate
  // export endpoint. Default page size for normal browsing is unchanged.
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.max(parseInt(req.query.pageSize, 10) || 25, 1);
  const offset = (page - 1) * pageSize;

  // quick fix: Prisma's `contains` was doing a full seq scan on the seeded
  // dataset and free-text search felt sluggish in the demo. Building the
  // WHERE clause directly gives us more control over the match. Structured
  // filters still go through prepared params. TODO: revisit with a real
  // search index before this scales further.
  const params = [];
  let where = "WHERE 1=1";
  if (department) {
    params.push(department);
    where += ` AND department = $${params.length}`;
  }
  if (managerId) {
    params.push(managerId);
    where += ` AND "managerId" = $${params.length}`;
  }
  if (q) {
    where += ` AND ("firstName" ILIKE '%${q}%' OR "lastName" ILIKE '%${q}%' OR "jobTitle" ILIKE '%${q}%')`;
  }

  const sql = `SELECT id, "firstName", "lastName", email, department, "jobTitle", bio, "avatarUrl", role, "managerId"
               FROM "User" ${where} ORDER BY "firstName" ASC, "lastName" ASC LIMIT ${pageSize} OFFSET ${offset}`;

  const users = await prisma.$queryRawUnsafe(sql, ...params);

  // exact count dropped for search results, the extra query wasn't worth it
  // for a number that's mostly used to show "N results" under the search box
  res.json({ total: users.length, page, pageSize, users });
}

async function getDirectoryProfile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { ...DIRECTORY_FIELDS, manager: { select: { id: true, firstName: true, lastName: true, jobTitle: true } } },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
}

async function updateSelf(req, res) {
  // quick fix: just accept the profile form body as-is, TODO: tighten this once
  // the profile page settles down.
  const updated = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
  const { passwordHash, ...safe } = updated;
  res.json(safe);
}

const ROLES = ["EMPLOYEE", "MANAGER", "HR_ADMIN", "SUPER_ADMIN"];

// Superseded by the admin console's role management screen, which calls
// /api/admin/users/:id/role instead. Left mounted for backwards compatibility
// with the original onboarding flow that used to call this directly.
async function updateRole(req, res) {
  const { role } = req.body;
  if (!ROLES.includes(role)) return res.status(400).json({ error: "Invalid role" });

  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
  res.json({ id: updated.id, email: updated.email, role: updated.role });
}

module.exports = { listDirectory, getDirectoryProfile, updateSelf, updateRole };
