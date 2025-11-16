const authService = require("../services/auth.service");
const redis = require("../config/redis");

class AuthController {
  // -----------------------------
  // 1. REGISTER APP
  // -----------------------------
  async register(req, res) {
    try {
      const { name, ownerEmail } = req.body;

      if (!name || !ownerEmail)
        return res.status(400).json({ error: "name and ownerEmail required" });

      const app = await authService.registerApp(name, ownerEmail);

      // Cache API key immediately for faster future lookups
      await redis.set(`apiKey:${app.apiKey}`, app.id);
      await redis.set(`appId:${app.id}`, app.apiKey); // helpful for getApiKey

      return res.status(201).json(app);
    } catch (err) {
      console.error("Register Error:", err);
      return res.status(500).json({ error: "Registration failed" });
    }
  }

  // -----------------------------
  // 2. GET API KEY (by appId)
  // -----------------------------
  async getApiKey(req, res) {
    try {
      const { appId } = req.query;
      if (!appId) return res.status(400).json({ error: "appId required" });

      // 1. Check Redis cache first
      const cachedKey = await redis.get(`appId:${appId}`);
      if (cachedKey) {
        return res.json({ apiKey: cachedKey, source: "redis" });
      }

      // 2. Fallback to DB via service
      const key = await authService.getApiKey(appId);
      if (!key) return res.status(404).json({ error: "App not found" });

      // 3. Cache it
      await redis.set(`appId:${appId}`, key.apiKey);
      await redis.set(`apiKey:${key.apiKey}`, appId);

      return res.json({ apiKey: key.apiKey, source: "db" });
    } catch (err) {
      console.error("Get API Key Error:", err);
      return res.status(500).json({ error: "Error retrieving API key" });
    }
  }

  // -----------------------------
  // 3. REVOKE API KEY
  // -----------------------------
  //  async revoke(req, res) {
  //     try {
  //       const { apiKey, appId } = req.body;

  //       if (!apiKey) {
  //         return res.status(400).json({ error: "apiKey is required" });
  //       }

  //       // Call service to revoke the key
  //       const revokedApp = await authService.revokeApiKey(apiKey, appId);

  //       if (!revokedApp) {
  //         return res.status(404).json({ error: "API key not found, already revoked, or invalid appId" });
  //       }

  //       // Remove from Redis cache
  //       await redis.del(`apiKey:${apiKey}`);

  //       return res.json({ message: "API key revoked successfully", apiKey });
  //     } catch (err) {
  //       console.error("Revoke Error:", err);
  //       return res.status(500).json({ error: "API key revoke failed" });
  //     }
  //   }

  // controllers/auth.controller.js (revoke method)
  async revoke(req, res) {
    try {
      const { apiKey, appId } = req.body;

      // Debug input
      console.log("Revoke called with body:", { apiKey, appId });

      if (!apiKey && !appId) {
        return res.status(400).json({ error: "apiKey or appId required" });
      }

      // Service will resolve app by apiKey or appId
      const revokedApp = await authService.revokeApiKey(apiKey, appId);

      // Debug result from service
      console.log("revokedApp result from service:", revokedApp);

      if (!revokedApp) {
        return res.status(404).json({
          error: "API key not found, already revoked, or invalid ownership",
        });
      }

      // Remove both cache entries (safe to attempt both)
      try {
        // If your redis client is callback-based (v3), see notes below about promisify
        if (revokedApp.apiKey) await redis.del(`apiKey:${revokedApp.apiKey}`);
        if (revokedApp.id) await redis.del(`appId:${revokedApp.id}`);
      } catch (e) {
        console.warn("Redis del during revoke failed:", e);
        // don't fail the revoke just because cache deletion failed
      }

      return res.json({
        message: "API key revoked successfully",
        appId: revokedApp.id,
        apiKey: revokedApp.apiKey,
      });
    } catch (err) {
      console.error("Revoke Error:", err);
      return res.status(500).json({ error: "API key revoke failed" });
    }
  }
}

module.exports = new AuthController();
