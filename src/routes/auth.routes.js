/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API Key management and App onboarding
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new app/website and generate an API key
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appName:
 *                 type: string
 *                 example: "My Web App"
 *               userEmail:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       201:
 *         description: App registered successfully
 *       400:
 *         description: Invalid input
 */

router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/api-key:
 *   get:
 *     summary: Retrieve current API key for an app
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: appId
 *         schema:
 *           type: string
 *         required: true
 *         description: App ID for which to fetch the API key
 *     responses:
 *       200:
 *         description: API key retrieved
 *       404:
 *         description: App not found
 */
router.get("/api-key", authController.getApiKey);

/**
 * @swagger
 * /api/auth/revoke:
 *   post:
 *     summary: Revoke an API key to disable further API access
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 example: "abc123xyz"
 *     responses:
 *       200:
 *         description: API key revoked
 *       400:
 *         description: Invalid or missing API key
 */
router.post("/revoke", authController.revoke);

module.exports = router;
