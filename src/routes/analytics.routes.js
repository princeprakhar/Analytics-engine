const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const apiKeyAuth = require("../middlewares/apiKeyAuth");
const rateLimit = require("../middlewares/rateLimit");

router.post("/collect", apiKeyAuth,rateLimit(100,60), analyticsController.collect);

module.exports = router;

