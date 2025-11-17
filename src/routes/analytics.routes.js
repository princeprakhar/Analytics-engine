/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Event collection, summaries, user stats, and analytics endpoints
 */
const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const apiKeyAuth = require("../middlewares/apiKeyAuth");
const rateLimit = require("../middlewares/rateLimit");

/**
 * @swagger
 * /api/analytics/collect:
 *   post:
 *     summary: Collect analytics event
 *     tags: [Analytics]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *         description: API key for the app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventName:
 *                 type: string
 *                 example: "page_view"
 *               url:
 *                 type: string
 *                 example: "https://example.com/home"
 *               referrer:
 *                 type: string
 *                 example: "https://google.com"
 *               device:
 *                 type: string
 *                 example: "mobile"
 *               ipAddress:
 *                 type: string
 *                 example: "192.168.1.1"
 *               metadata:
 *                 type: object
 *                 example: { "browser": "Chrome", "os": "Android" }
 *     responses:
 *       201:
 *         description: Event collected successfully
 *       403:
 *         description: Invalid API key
 */

// POST /collect is write-heavy, so we enforce a strict 50 req/min limit.
router.post(
  "/collect",
  apiKeyAuth,
  rateLimit(50, 60),
  analyticsController.collect
);

/**
 * @swagger
 * /api/analytics/event-summary:
 *   get:
 *     summary: Get analytics summary for a specific event
 *     tags: [Analytics]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *         description: API key for the app
 *       - in: query
 *         name: eventName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the event to summarize
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Event summary returned
 */
// GET routes use Redis caching so rate limiting is optional.
router.get(
  "/event-summary",
  apiKeyAuth,
  rateLimit(100, 60),
  analyticsController.eventSummary
);

/**
 * @swagger
 * /api/analytics/user-stats:
 *   get:
 *     summary: Retrieve stats for a specific user based on IP or ID
 *     tags: [Analytics]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: userIp
 *         schema:
 *           type: string
 *         required: true
 *         description: required userIp
 *     responses:
 *       200:
 *         description: User stats returned
 */
router.get(
  "/user-stats",
  apiKeyAuth,
  rateLimit(100, 60),
  analyticsController.userStats
);

/**
 * @swagger
 * /api/analytics/daily-stats:
 *   get:
 *     summary: Retrieve daily event counts for the last N days
 *     tags: [Analytics]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of past days to include
 *     responses:
 *       200:
 *         description: Daily stats returned
 */
router.get(
  "/daily-stats",
  apiKeyAuth,
  rateLimit(100, 60),
  analyticsController.dailyStats
);

/**
 * @swagger
 * /api/analytics/top-pages:
 *   get:
 *     summary: Retrieve top viewed pages for the app
 *     tags: [Analytics]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: List of top pages returned
 */
router.get(
  "/top-pages",
  apiKeyAuth,
  rateLimit(100, 60),
  analyticsController.topPages
);

module.exports = router;
