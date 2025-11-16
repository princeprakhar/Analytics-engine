const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const redis = require("../config/redis");

module.exports = async function apiKeyAuth(req, res, next) {
  const apiKey = req.header("x-api-key");

  if (!apiKey) return res.status(403).json({ error: "API key missing" });

  try {
    // 1. Try Redis cache
    const cachedAppId = await redis.get(`apiKey:${apiKey}`);

    if (cachedAppId) {
      req.appId = cachedAppId;
      return next();
    }

    // 2. If not found, query DB
    const app = await prisma.app.findUnique({
      where: { apiKey },
      select: { id: true },
    });

    if (!app) return res.status(403).json({ error: "Invalid API Key" });

    // 3. Cache API key for future
    await redis.setex(`apiKey:${apiKey}`, 3600, app.id);
    req.appId = app.id;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Auth error" });
  }
};
