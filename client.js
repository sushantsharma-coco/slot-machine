const ioredis = require("ioredis");

const redisClient = new ioredis.Redis({
  host: "127.0.0.1",
  port: 6379,
});

module.exports = { redisClient };
