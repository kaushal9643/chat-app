// server/redis.js
import Redis from "ioredis";

let redis;

if (process.env.REDIS_URL) {
  // Production / Upstash TCP Redis
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
  });
  console.log("Connected to Redis (TCP / Upstash)");
} else {
  // Fallback (local Redis)
  redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
  });
  console.log("Connected to Local Redis");
}

export { redis };
