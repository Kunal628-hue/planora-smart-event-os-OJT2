import { cacheService } from "../utils/cacheService.js";

/**
 * Express middleware to cache GET requests in Redis / In-Memory cache.
 * @param {number} durationSeconds - Cache TTL in seconds (default 300s = 5m)
 * @param {string} prefix - Custom key prefix (e.g. 'vendors', 'events')
 */
export const cacheRoute = (durationSeconds = 300, prefix = "route") => async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
        return next();
    }

    const userId = req.headers["x-user-id"] || req.headers["x-user-email"] || "public";
    const cacheKey = `${prefix}:${userId}:${req.originalUrl || req.url}`;

    try {
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
            res.setHeader("X-Cache", "HIT");
            res.setHeader("X-Cache-TTL", `${durationSeconds}s`);
            return res.json(cachedData);
        }

        // Intercept res.json to store in cache on MISS
        res.setHeader("X-Cache", "MISS");
        const originalJson = res.json.bind(res);

        res.json = (body) => {
            // Only cache successful HTTP 200 responses
            if (res.statusCode === 200 && body) {
                cacheService.set(cacheKey, body, durationSeconds).catch((err) => {
                    console.warn("[Cache Middleware] Failed to write cache:", err.message);
                });
            }
            return originalJson(body);
        };

        next();
    } catch (err) {
        console.warn("[Cache Middleware] Error in cache check, passing through to DB:", err.message);
        next();
    }
};

export const clearCachePattern = async (prefix) => {
    await cacheService.invalidatePattern(prefix);
};
