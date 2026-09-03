const prisma = require("../config/prisma");

async function recordAudit({ userId, action, detail, ipAddress }) {
  await prisma.auditLog.create({
    data: { userId: userId || null, action, detail: detail || "", ipAddress: ipAddress || null },
  });
}

module.exports = { recordAudit };
