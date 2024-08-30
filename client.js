const ioredis = require("ioredis");

const redisClient = new ioredis.Redis({
  host: process.env.REDIS_CLIENT_HOST,
  port: process.env.REDIS_CLIENT_PORT,
});

if (redisClient) console.log("redis-connection successful");

(async () => {
  await redisClient.set("house", JSON.stringify({ houseState: 1 }));
})();

module.exports = { redisClient };
