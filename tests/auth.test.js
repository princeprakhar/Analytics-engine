// tests/auth.test.js
const request = require("supertest");
const app = require("../src/app"); // must export the express app (no listen)

jest.setTimeout(20000);

describe("Auth Routes", () => {
  let apiKey;
  let appId;

  test("POST /api/auth/register → should register app", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: `Test App ${Date.now()}`, ownerEmail: `test+${Date.now()}@app.com` });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("apiKey");
    expect(res.body).toHaveProperty("id");

    apiKey = res.body.apiKey;
    appId = res.body.id;

    expect(typeof apiKey).toBe("string");
    expect(typeof appId).toBe("string");
  });

  test("GET /api/auth/api-key → should retrieve API key by appId", async () => {
    const res = await request(app)
      .get("/api/auth/api-key")
      .query({ appId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("apiKey");
    expect(res.body.apiKey).toBe(apiKey);
  });

  test("POST /api/auth/revoke → should revoke app (try appId then fallback to apiKey)", async () => {
    // Try revoke using appId first (common in Postman)
    const revokeByApp = await request(app).post("/api/auth/revoke").send({ appId });
    expect([200, 204]).toContain(revokeByApp.statusCode);

    // Check what GET /api/auth/api-key returns now
    const check = await request(app).get("/api/auth/api-key").query({ appId });

    // If GET still returns the same apiKey, attempt revoke by apiKey as a fallback
    if (check.statusCode === 200 && check.body.apiKey === apiKey) {
      console.warn("Revoke by appId did not remove key; trying revoke by apiKey as fallback");

      const revokeByKey = await request(app).post("/api/auth/revoke").send({ apiKey });
      // Some implementations return 400 for this shape; accept 200/204/400
      expect([200, 204, 400]).toContain(revokeByKey.statusCode);

      // Re-check
      const check2 = await request(app).get("/api/auth/api-key").query({ appId });

      // Accept either: key changed, not found, or 400/404 depending on implementation
      if (check2.statusCode === 200) {
        expect(check2.body.apiKey).not.toBe(apiKey);
      } else {
        expect([400, 404, 204]).toContain(check2.statusCode);
      }
    } else {
      // If initial check already showed key removed or endpoint returned 400/404, accept that
      if (check.statusCode === 200) {
        expect(check.body.apiKey).not.toBe(apiKey);
      } else {
        expect([400, 404, 204]).toContain(check.statusCode);
      }
    }
  });
});

