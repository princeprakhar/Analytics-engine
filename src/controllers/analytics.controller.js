const analyticsService = require("../services/analytics.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const redis = require("../config/redis");

class AnalyticsController {
  // ----------------------------
  // 1. COLLECT EVENT
  // ----------------------------
  async collect(req, res) {
    try {
      const appId = req.appId;

      if (!appId) {
        return res.status(403).json({ error: "Invalid or missing API key" });
      }

      const event = await analyticsService.collectEvent(appId, req.body);

      return res.status(201).json({
        message: "Event collected",
        event,
      });
    } catch (err) {
      console.error("Collect Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // ----------------------------
  // 2. EVENT SUMMARY
  // ----------------------------
  async eventSummary(req, res) {
    try {
      const { eventName, startDate, endDate } = req.query;
      const appId = req.appId;

      if (!eventName) {
        return res.status(400).json({ error: "eventName is required" });
      }

      const cacheKey = `summary:${appId}:${eventName}:${startDate}:${endDate}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const data = await analyticsService.eventSummary(
        appId,
        eventName,
        startDate,
        endDate
      );

      await redis.setex(cacheKey, 30, JSON.stringify(data)); // 30s cache

      res.json(data);
    } catch (err) {
      console.error("Event Summary Error:", err);
      res.status(500).json({ error: "Analytics Error" });
    }
  }

  // ----------------------------
  // 3. USER STATS
  // ----------------------------
  async userStats(req, res) {
    try {
      const { userIp } = req.query;

      if (!userIp) {
        return res.status(400).json({ error: "userIp is required" });
      }

      const appId = req.appId;

      const data = await analyticsService.userStats(appId, userIp);

      res.json(data);
    } catch (err) {
      console.error("User Stats Error:", err);
      res.status(500).json({ error: "User Stats Error" });
    }
  }

  // ----------------------------
  // 4. DAILY STATS
  // ----------------------------
  async dailyStats(req, res) {
    try {
      const appId = req.appId;
      const days = Number(req.query.days) || 7;

      const data = await analyticsService.dailyStats(appId, days);

      res.json(data);
    } catch (err) {
      console.error("Daily Stats Error:", err);
      res.status(500).json({ error: "Timeline Stats Error" });
    }
  }

  // ----------------------------
  // 5. TOP PAGES
  // ----------------------------
  async topPages(req, res) {
    try {
      const appId = req.appId;

      const data = await analyticsService.topPages(appId);

      res.json(data);
    } catch (err) {
      console.error("Top Pages Error:", err);
      res.status(500).json({ error: "Top Pages Error" });
    }
  }
}

module.exports = new AnalyticsController();
