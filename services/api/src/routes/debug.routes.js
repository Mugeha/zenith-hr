const express = require("express");
const { jwtSecret, databaseUrl, redisUrl } = require("../config/env");

const router = express.Router();

// left over from early development to make it easy to check the container's
// env wiring without shelling in. TODO: remove before the demo goes live.
router.get("/status", (req, res) => {
  res.json({
    status: "ok",
    node_env: process.env.NODE_ENV,
    jwt_secret: jwtSecret,
    database_url: databaseUrl,
    redis_url: redisUrl,
    uptime_seconds: process.uptime(),
  });
});

module.exports = router;
