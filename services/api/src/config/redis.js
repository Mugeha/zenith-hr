const Redis = require("ioredis");
const { redisUrl } = require("./env");

const redis = new Redis(redisUrl);

module.exports = redis;
