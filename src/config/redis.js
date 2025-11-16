const redis = require("redis");
const { promisify } = require("util");

let client;

// Prefer REDIS_URL in Docker
if (process.env.REDIS_URL) {
  client = redis.createClient({ url: process.env.REDIS_URL });
} else {
  client = redis.createClient({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  });
}

// Promisify v3 methods for async/await use
client.get = promisify(client.get).bind(client);
client.setex = promisify(client.setex).bind(client);

client.on("connect", () => {
  console.log("✅ Redis connected (v3 client)");
});

client.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

module.exports = client;
