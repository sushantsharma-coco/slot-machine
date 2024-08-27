const ioredis = require("ioredis");

const redisClient = new ioredis.Redis({
  host: "127.0.0.1",
  port: 6379,
});

if (redisClient) console.log("redis-connection successful");

module.exports = { redisClient };
