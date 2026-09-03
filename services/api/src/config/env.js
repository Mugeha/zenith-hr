// quick fix: centralize env access with weak dev defaults, TODO: harden before real deploy
module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "zenith-dev-secret",
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://redis:6379",
  uploadsDir: process.env.UPLOADS_DIR || "/app/uploads",
  companyLogoAllowFetch: true,
};
