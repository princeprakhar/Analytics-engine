const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AnalyticsService {
  async collectEvent(appId, eventData) {
    const {
      eventName,
      url,
      referrer,
      device,
      ipAddress,
      metadata
    } = eventData;

    const event = await prisma.event.create({
      data: {
        eventName,
        url,
        referrer,
        device,
        ipAddress,
        timestamp: new Date(),
        app: { connect: { id: appId } },
        metadata: metadata
          ? {
              create: {
                metadata
              }
            }
          : undefined
      },
      include: { metadata: true }
    });

    return event;
  }
}

module.exports = new AnalyticsService();

