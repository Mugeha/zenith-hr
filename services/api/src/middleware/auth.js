const { verifyToken } = require("../services/token.service");
const prisma = require("../config/prisma");

async function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.zh_session;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return res.status(401).json({ error: "Invalid session" });

  req.user = user;
  next();
}

module.exports = requireAuth;
