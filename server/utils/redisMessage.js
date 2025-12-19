import {redis} from "../redis.js";

export const saveMessageToRedis = async (roomId, messageData) => {
  if (!redis) return;

  try {
    const key = `chat:${roomId}`;
    await redis.rpush(key, JSON.stringify(messageData));
    await redis.ltrim(key, -100, -1);
  } catch (err) {
    console.error("Redis save failed:", err.message);
  }
};

export const getMessagesFromRedis = async (roomId) => {
  if (!redis) return null;

  try {
    const key = `chat:${roomId}`;
    const cached = await redis.lrange(key, 0, -1);
    return cached.length ? cached.map(JSON.parse) : null;
  } catch (err) {
    console.error("Redis fetch failed:", err.message);
    return null;
  }
};
