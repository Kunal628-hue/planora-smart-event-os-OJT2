import NodeCache from "node-cache";
import Redis from "ioredis";

// In-Memory Fallback Cache (Default 5 min TTL)
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });

let redisClient = null;
let isRedisAvailable = false;

// Attempt Redis connection if REDIS_URL or REDIS_HOST is provided
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    try {
        const redisConfig = process.env.REDIS_URL || {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            connectTimeout: 5000,
            maxRetriesPerRequest: 1
        };

        redisClient = new Redis(redisConfig);

        redisClient.on("connect", () => {
            isRedisAvailable = true;
            console.log("⚡ [Cache Engine] Connected to Redis cluster successfully.");
        });

        redisClient.on("error", (err) => {
            isRedisAvailable = false;
            console.warn("⚠️ [Cache Engine] Redis connection unavailable. Falling back to high-speed In-Memory LRU Cache.", err.message);
        });
    } catch (err) {
        console.warn("⚠️ [Cache Engine] Redis initialization error. Using In-Memory Cache fallback.");
    }
} else {
    console.log("ℹ️ [Cache Engine] Running on In-Memory LRU Cache (Add REDIS_URL to enable cloud Redis).");
}

export const cacheService = {
    async get(key) {
        try {
            if (isRedisAvailable && redisClient) {
                const data = await redisClient.get(key);
                return data ? JSON.parse(data) : null;
            }
        } catch (err) {
            console.warn(`[Cache Error] Redis get failed for ${key}, checking fallback:`, err.message);
        }
        return localCache.get(key) || null;
    },

    async set(key, value, ttlSeconds = 300) {
        try {
            if (isRedisAvailable && redisClient) {
                await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
            }
        } catch (err) {
            console.warn(`[Cache Error] Redis set failed for ${key}:`, err.message);
        }
        localCache.set(key, value, ttlSeconds);
    },

    async del(key) {
        try {
            if (isRedisAvailable && redisClient) {
                await redisClient.del(key);
            }
        } catch (err) {
            console.warn(`[Cache Error] Redis del failed for ${key}:`, err.message);
        }
        localCache.del(key);
    },

    async invalidatePattern(prefix) {
        try {
            if (isRedisAvailable && redisClient) {
                const keys = await redisClient.keys(`${prefix}*`);
                if (keys.length > 0) {
                    await redisClient.del(keys);
                }
            }
        } catch (err) {
            console.warn(`[Cache Error] Redis pattern invalidation failed for ${prefix}:`, err.message);
        }
        
        // Invalidate matching keys in local memory cache
        const localKeys = localCache.keys();
        localKeys.forEach((key) => {
            if (key.startsWith(prefix)) {
                localCache.del(key);
            }
        });
    }
};
