const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AnalyticsService {
  /* -------------------------------------------------------
     1. COLLECT EVENT
  -------------------------------------------------------- */
  async collectEvent(appId, eventData) {
    const { eventName, url, referrer, device, ipAddress, metadata } = eventData;

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
                metadata,
              },
            }
          : undefined,
      },
      include: { metadata: true },
    });

    return event;
  }

  /* -------------------------------------------------------
     2. EVENT SUMMARY
  -------------------------------------------------------- */
  async eventSummary(appId, eventName, startDate, endDate) {
    const where = {
      appId,
      eventName,
      timestamp: {},
    };

    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);

    const total = await prisma.event.count({ where });

    const deviceData = await prisma.event.groupBy({
      by: ["device"],
      _count: { device: true },
      where,
    });

    const uniqueUsers = await prisma.event.groupBy({
      by: ["ipAddress"],
      where,
    });

    return {
      event: eventName,
      count: total,
      uniqueUsers: uniqueUsers.length,
      deviceData,
    };
  }

  /* -------------------------------------------------------
     3. USER STATS
  -------------------------------------------------------- */
  async userStats(appId, userIp) {
    const events = await prisma.event.findMany({
      where: {
        appId,
        ipAddress: userIp,
      },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    if (events.length === 0) {
      return { message: "No events for this user" };
    }

    const deviceInfo = events[0];

    return {
      ipAddress: userIp,
      totalEvents: events.length,
      recentEvents: events,
      deviceDetails: {
        browser: deviceInfo.metadata?.metadata.browser,
        os: deviceInfo.metadata?.metadata.os,
      },
    };
  }

  /* -------------------------------------------------------
     4. DAILY STATS (FIXED)
        - Correct table: "Event"
        - Correct column: "timestamp"
        - No duplicates
  -------------------------------------------------------- */
  async dailyStats(appId, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const data = await prisma.$queryRaw`
    SELECT 
      DATE("timestamp") AS date,
      COUNT(*) AS count
    FROM "Event"
    WHERE "appId" = ${appId}
      AND "timestamp" >= ${since}
      AND "timestamp" IS NOT NULL
    GROUP BY DATE("timestamp")
    ORDER BY DATE("timestamp") DESC
    LIMIT 30;
  `;

    return data.map((row) => ({
      date: row.date ? row.date.toISOString().split("T")[0] : null,
      count: Number(row.count),
    }));
  }

  /* -------------------------------------------------------
     5. TOP PAGES
  -------------------------------------------------------- */
  async topPages(appId, limit = 5) {
    const data = await prisma.event.groupBy({
      by: ["url"],
      _count: { url: true },
      where: { appId },
      orderBy: { _count: { url: "desc" } },
      take: limit,
    });

    return data;
  }
}

module.exports = new AnalyticsService();
