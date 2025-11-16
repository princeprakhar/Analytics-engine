const analyticsService = require("../services/analytics.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AnalyticsController {
  async collect(req, res) {
    try {
      const apiKey = req.header("x-api-key");

      const app = await prisma.app.findUnique({
        where: { apiKey },
        select: { id: true }
      });

      if (!app) return res.status(403).json({ error: "Invalid API key" });

      const event = await analyticsService.collectEvent(app.id, req.body);
      return res.status(201).json({ message: "Event collected", event });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new AnalyticsController();

