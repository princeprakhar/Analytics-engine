const { createClient } = require("redis");

const redis = createClient({
  socket: {
    host: "127.0.0.1",   // explicitly set
    port: 6379,          // default redis port
    reconnectStrategy: () => 3000
  }
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("ready", () => console.log("🚀 Redis ready"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

module.exports = redis;

