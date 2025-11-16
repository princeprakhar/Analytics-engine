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
    return await prisma.app.findFirst({
      where: {
        id: appId,
        isRevoked: false,
      },
      select: {
        apiKey: true,
        isRevoked: true,
        expiresAt: true,
      },
    });
  }

  async revokeApiKey(apiKey, appId) {
    let app;
    if (apiKey) {
      app = await prisma.app.findUnique({ where: { apiKey } });
    } else if (appId) {
      app = await prisma.app.findUnique({ where: { id: appId } });
    }

    if (!app) {
      return null;
    }

    if (apiKey && appId && app.id !== appId) {
      return null;
    }

    if (app.isRevoked) {
      return null;
    }
    const revokedApp = await prisma.app.update({
      where: { id: app.id },
      data: { isRevoked: true },
    });

    return revokedApp;
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
