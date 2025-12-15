import redis from '../redis.js';

// export const saveMessageToRedis = async (roomId, messageData) => {
//     const key = `chat:${roomId}`;
//     await redis.lpush(key, JSON.stringify(messageData));
//     await redis.ltrim(key, 0, 99);
//     // console.log("Saved to Redis:", key, messageData.text || messageData.image);
// };

export const saveMessageToRedis = async (roomId, messageData) => {
    const key = `chat:${roomId}`;
    await redis.rpush(key, JSON.stringify(messageData));  // 👈 RPUSH = append to end
    await redis.ltrim(key, -100, -1);                     // keep latest 100 messages
};

// export const getMessagesFromRedis = async (roomId) => {
//     const key = `chat:${roomId}`;
//     const cached = await redis.lrange(key, 0, 99);
//     return cached.map(JSON.parse);
// };


export const getMessagesFromRedis = async (roomId) => {
    const key = `chat:${roomId}`;
    const cached = await redis.lrange(key, 0, -1); // oldest → newest
    return cached.map(JSON.parse);
};
