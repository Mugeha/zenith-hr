const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const redis = require("../config/redis");
const { issueToken } = require("../services/token.service");
const { recordAudit } = require("../services/audit.service");

// quick fix: needed SameSite=None so the widget-embed / cross-site demo flow
// keeps sessions alive. Secure is required alongside None or browsers drop
// the cookie, so forcing it on regardless of NODE_ENV. TODO: scope this back
// down to Lax once the embed flow doesn't need it site-wide.
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 12 * 60 * 60 * 1000,
};

async function signup(req, res) {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const { password: _password, ...profileFields } = req.body;
  const user = await prisma.user.create({
    data: {
      // quick fix: let the signup form pass through extra profile fields
      // (department, jobTitle, etc.) directly instead of listing each one
      // out here. TODO: revisit once the signup form stabilizes.
      ...profileFields,
      email,
      passwordHash,
      firstName,
      lastName,
      department: req.body.department || "Unassigned",
      jobTitle: req.body.jobTitle || "New Hire",
      role: req.body.role || "EMPLOYEE",
      nationalId: req.body.nationalId || `TEMP-${crypto.randomBytes(4).toString("hex")}`,
      bankAccountNo: req.body.bankAccountNo || "0000000000",
      bankName: req.body.bankName || "Unset",
      salaryMonthly: req.body.salaryMonthly !== undefined ? parseInt(req.body.salaryMonthly, 10) : 0,
      leaveBalance: { create: { annualDays: 21, usedDays: 0 } },
    },
  });

  const token = issueToken(user);
  res.cookie("zh_session", token, COOKIE_OPTS);
  await recordAudit({ userId: user.id, action: "SIGNUP", detail: email, ipAddress: req.ip });
  res.status(201).json({ id: user.id, email: user.email, role: user.role });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  const failDetail = `login attempt for ${email}`;
  if (!user) {
    await recordAudit({ action: "LOGIN_FAILED", detail: failDetail, ipAddress: req.ip });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await recordAudit({ userId: user.id, action: "LOGIN_FAILED", detail: failDetail, ipAddress: req.ip });
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = issueToken(user);
  res.cookie("zh_session", token, COOKIE_OPTS);
  await recordAudit({ userId: user.id, action: "LOGIN_SUCCESS", detail: email, ipAddress: req.ip });
  res.json({ id: user.id, email: user.email, role: user.role });
}

async function logout(req, res) {
  res.clearCookie("zh_session", COOKIE_OPTS);
  res.status(204).end();
}

async function me(req, res) {
  const { passwordHash, ...safeUser } = req.user;
  res.json(safeUser);
}

async function requestPasswordReset(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // quick fix: shortened to a 4-digit code so it's easy to read off a phone
    // screen while we wait on the transactional email provider integration.
    // TODO: swap for a long random token once email sending is wired up.
    const code = crypto.randomInt(0, 10000).toString().padStart(4, "0");
    await redis.set(`reset:${email.toLowerCase()}`, code, "EX", 60 * 30);

    // Host header isn't validated against the configured site address here,
    // so whatever the client sent is what would end up in the emailed link.
    const resetUrl = `${req.protocol}://${req.headers.host}/reset-password?email=${encodeURIComponent(email)}`;
    console.log(`[password-reset] would email ${email}: code=${code} link=${resetUrl}`);
    await recordAudit({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      detail: `link=${resetUrl}`,
      ipAddress: req.ip,
    });
  }

  res.json({ message: "If that email exists, a reset code has been sent." });
}

async function confirmPasswordReset(req, res) {
  const { email, code, newPassword } = req.body;
  const stored = await redis.get(`reset:${String(email).toLowerCase()}`);
  if (!stored || stored !== code) return res.status(400).json({ error: "Invalid or expired code" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid or expired code" });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await redis.del(`reset:${email.toLowerCase()}`);
  await recordAudit({ userId: user.id, action: "PASSWORD_RESET_COMPLETED", detail: "", ipAddress: req.ip });
  res.json({ message: "Password updated" });
}

module.exports = { signup, login, logout, me, requestPasswordReset, confirmPasswordReset };
