const redis = require("../config/redis");

module.exports = function rateLimit(limit = 50, windowSec = 60) {
  return async function (req, res, next) {
    const apiKey = req.header("x-api-key");
    const redisKey = `rate:${apiKey}`;

    const current = await redis.incr(redisKey);

    if (current === 1) {
      await redis.expire(redisKey, windowSec);
    }

    if (current > limit) {
      return res.status(429).json({
        error: "Rate limit exceeded. Try again later.",
      });
    }

    next();
  };
};
