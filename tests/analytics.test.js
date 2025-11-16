// tests/analytics.test.js
const request = require("supertest");
const app = require("../src/app");
const redisClient = require("../src/config/redis"); 

jest.setTimeout(30000);

describe("Analytics Routes", () => {
  let apiKey;
  let appId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: `Analytics Test App ${Date.now()}`,
        ownerEmail: `analytics+${Date.now()}@test.com`,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("apiKey");
    expect(res.body).toHaveProperty("id");

    apiKey = res.body.apiKey;
    appId = res.body.id;

    if (!apiKey || !appId) {
      throw new Error("Failed to generate API key for analytics tests");
    }
  }, 20000);

  test("POST /api/analytics/collect → should collect event", async () => {
    const res = await request(app)
      .post("/api/analytics/collect")
      .set("x-api-key", apiKey)
      .send({
        eventName: "page_view",
        url: "/home",
        device: "desktop",
        ipAddress: "127.0.0.1",
        userId: "test-user",
        metadata: { browser: "Chrome", os: "Windows" },
        appId, 
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("event");
    expect(res.body.event).toHaveProperty("eventName", "page_view");
  });

  test("GET /api/analytics/event-summary → should return summary (eventName)", async () => {
    const res = await request(app)
      .get("/api/analytics/event-summary")
      .set("x-api-key", apiKey)
      .query({ eventName: "page_view", appId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(typeof res.body.count).toBe("number");
  });

  test("GET /api/analytics/user-stats → should return user stats (try userId then fallback to userIp)", async () => {
    // Try userId first
    let res = await request(app)
      .get("/api/analytics/user-stats")
      .set("x-api-key", apiKey)
      .query({ userId: "test-user", appId });

    // If server returns 400 (bad request), try userIp (some implementations index by IP)
    if (res.statusCode === 400) {
      console.warn(
        "user-stats rejected userId; retrying with userIp=127.0.0.1"
      );
      res = await request(app)
        .get("/api/analytics/user-stats")
        .set("x-api-key", apiKey)
        .query({ userIp: "127.0.0.1", appId });
    }

    // Accept either 200 (with expected shape) or 400 if that represents an intended behavior
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("totalEvents");
      expect(typeof res.body.totalEvents).toBe("number");
    } else {
      // If still 400, fail with helpful message so logs show what shape server expects
      throw new Error(
        `GET /api/analytics/user-stats failed with status ${
          res.statusCode
        }. Response body: ${JSON.stringify(res.body)}`
      );
    }
  });

  test("GET /api/analytics/daily-stats → should return daily stats", async () => {
    const res = await request(app)
      .get("/api/analytics/daily-stats")
      .set("x-api-key", apiKey)
      .query({ days: 7, appId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
  });

  test("GET /api/analytics/top-pages → should return top pages array", async () => {
    const res = await request(app)
      .get("/api/analytics/top-pages")
      .set("x-api-key", apiKey)
      .query({ appId });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    // Revoke the app to clean up (best-effort)
    try {
      if (appId) {
        await request(app).post("/api/auth/revoke").send({ appId });
      }
    } catch (err) {
      // ignore revoke errors in teardown
    }

    // Close redis if available
    try {
      if (redisClient && typeof redisClient.quit === "function") {
        await redisClient.quit();
      }
    } catch (err) {
      // ignore redis close errors
    }
  }, 20000);
});
