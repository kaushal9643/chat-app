import Redis from "ioredis";

// Check if Vercel REST credentials exist
const isVercel = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

let redis;

if (isVercel) {
  // Upstash REST Redis
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    retryStrategy: (times) => {
      // exponential backoff
      return Math.min(times * 50, 2000);
    },
  });
  console.log("Connected to Upstash Redis (REST)");
} else {
  // Local Redis
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  console.log("Connected to Local Redis");
}

export default redis;
