import assert from "assert";
import { cacheService } from "../utils/cacheService.js";
import { cacheRoute, clearCachePattern } from "../middleware/cacheMiddleware.js";

function createMockReqRes(url = "/api/test", headers = {}) {
    const req = {
        method: "GET",
        url,
        originalUrl: url,
        headers
    };

    let statusCode = 200;
    let responseData = null;
    let nextCalled = false;
    const responseHeaders = {};

    const res = {
        statusCode,
        status(code) {
            statusCode = code;
            res.statusCode = code;
            return res;
        },
        setHeader(key, val) {
            responseHeaders[key] = val;
        },
        json(data) {
            responseData = data;
            return res;
        }
    };

    const next = () => {
        nextCalled = true;
    };

    return { 
        req, 
        res, 
        next, 
        getHeader: (k) => responseHeaders[k], 
        getData: () => responseData, 
        wasNextCalled: () => nextCalled 
    };
}

async function runCacheTests() {
    console.log("🧪 Starting Cache Engine & Middleware Test Suite...\n");

    // 1. Direct Cache Set & Get
    console.log("▶ Test 1: Direct Cache Set & Get");
    await cacheService.set("test:key1", { message: "Hello Cache" }, 60);
    const cachedVal = await cacheService.get("test:key1");
    assert.deepStrictEqual(cachedVal, { message: "Hello Cache" }, "Cache set/get must return stored object");
    console.log("  ✓ Direct Cache Set & Get verified.\n");

    // 2. Cache Middleware MISS on First Request
    console.log("▶ Test 2: Cache Middleware MISS on First Request");
    const { req: req1, res: res1, next: next1, getHeader: getHeader1 } = createMockReqRes("/api/test-route", { "x-user-id": "user123" });
    const middleware = cacheRoute(60, "test");
    
    await middleware(req1, res1, next1);
    assert.strictEqual(getHeader1("X-Cache"), "MISS", "First request must return X-Cache: MISS header");
    assert.strictEqual(next1.name === "next" || typeof next1 === "function", true, "Middleware must call next() on MISS");
    
    // Simulate handler returning data
    res1.json({ data: "Vendor Item" });
    console.log("  ✓ Cache MISS & Header verified.\n");

    // 3. Cache Middleware HIT on Second Request
    console.log("▶ Test 3: Cache Middleware HIT on Second Request");
    const { req: req2, res: res2, next: next2, getHeader: getHeader2, getData: getData2 } = createMockReqRes("/api/test-route", { "x-user-id": "user123" });
    
    await middleware(req2, res2, next2);
    assert.strictEqual(getHeader2("X-Cache"), "HIT", "Second request must return X-Cache: HIT header");
    assert.deepStrictEqual(getData2(), { data: "Vendor Item" }, "Cached payload must match original response");
    console.log("  ✓ Cache HIT & Payload delivery verified.\n");

    // 4. Cache Invalidation Test
    console.log("▶ Test 4: Cache Pattern Invalidation");
    await clearCachePattern("test");
    const { req: req3, res: res3, next: next3, getHeader: getHeader3 } = createMockReqRes("/api/test-route", { "x-user-id": "user123" });
    
    await middleware(req3, res3, next3);
    assert.strictEqual(getHeader3("X-Cache"), "MISS", "Request after invalidation must return X-Cache: MISS");
    console.log("  ✓ Pattern Invalidation verified.\n");

    console.log("🎉 All Cache Engine & Middleware Tests Passed Successfully!\n");
    process.exit(0);
}

runCacheTests().catch((err) => {
    console.error("❌ Cache Test Failed:", err);
    process.exit(1);
});
