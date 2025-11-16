const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.get("/api-key", authController.getApiKey);
router.post("/revoke", authController.revoke);

module.exports = router;

