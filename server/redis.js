// server/redis.js
import Redis from "ioredis";

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    tls: {},
  });

  redis.on("connect", () => {
    console.log("Connected to Redis (Upstash)");
  });

  redis.on("error", (err) => {
    console.error("Redis error:", err.message);
  });

} else {
  redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
  });

  redis.on("connect", () => {
    console.log("✅ Connected to Local Redis");
  });

  redis.on("error", (err) => {
    console.error("Local Redis error:", err.message);
  });
}

export { redis };
