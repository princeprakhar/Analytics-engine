const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

class AuthService {
  async registerApp(name, ownerEmail) {
    const apiKey = uuidv4(); // generate random API key
    const app = await prisma.app.create({
      data: {
        name,
        ownerEmail,
        apiKey,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days expiry
      },
    });
    return { id: app.id, apiKey: app.apiKey };
  }

  async getApiKey(appId) {
    return await prisma.app.findUnique({
      where: { id: appId },
      select: { apiKey: true, isRevoked: true, expiresAt: true },
    });
  }

  async revokeApiKey(appId) {
    return await prisma.app.update({
      where: { id: appId },
      data: { isRevoked: true },
    });
  }

  async validateApiKey(apiKey) {
    const app = await prisma.app.findUnique({
      where: { apiKey },
    });
    if (!app) return false;
    if (app.isRevoked) return false;
    if (app.expiresAt && app.expiresAt < new Date()) return false;
    return true;
  }
}

module.exports = new AuthService();

