import assert from "assert";
import {
  authRateLimiter,
  publicRateLimiter,
  authenticatedRateLimiter,
  calculateExponentialBackoff,
  resetRateLimitStores
} from "../middleware/rateLimiter.js";
import { getRateLimitConfig } from "../config/rateLimitConfig.js";

// Helper to create mock Express Request & Response objects
function createMockReqRes({ ip = "127.0.0.1", body = {}, headers = {}, path = "/api/auth/login" } = {}) {
  const req = {
    ip,
    body,
    headers,
    path,
    socket: { remoteAddress: ip }
  };

  const resHeaders = {};
  let statusCode = 200;
  let responseBody = null;
  let finishCallback = null;

  const res = {
    statusCode: 200,
    setHeader(name, value) {
      resHeaders[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return resHeaders[name.toLowerCase()];
    },
    status(code) {
      statusCode = code;
      res.statusCode = code;
      return res;
    },
    json(data) {
      responseBody = data;
      if (finishCallback) finishCallback();
      return res;
    },
    on(event, callback) {
      if (event === "finish") finishCallback = callback;
    }
  };

  return { req, res, getHeaders: () => resHeaders, getStatus: () => statusCode, getBody: () => responseBody, triggerFinish: () => { if (finishCallback) finishCallback(); } };
}

async function runTests() {
  console.log("🧪 Starting Planora Rate Limiting Test Suite...\n");

  // 1. Test Exponential Backoff Calculation
  console.log("▶ Test 1: Exponential Backoff Calculation");
  assert.strictEqual(calculateExponentialBackoff(1, 1000, 2, 30000), 1000, "Base delay for 1st attempt should be 1000ms");
  assert.strictEqual(calculateExponentialBackoff(2, 1000, 2, 30000), 2000, "2nd attempt should be 2000ms");
  assert.strictEqual(calculateExponentialBackoff(3, 1000, 2, 30000), 4000, "3rd attempt should be 4000ms");
  assert.strictEqual(calculateExponentialBackoff(4, 1000, 2, 30000), 8000, "4th attempt should be 8000ms");
  assert.strictEqual(calculateExponentialBackoff(10, 1000, 2, 30000), 30000, "Should cap at maxDelayMs (30000ms)");
  console.log("  ✓ Exponential backoff mathematical progression verified.\n");

  // 2. Test Auth Per-Account Rate Limit & Backoff Headers
  console.log("▶ Test 2: Per-Account Auth Rate Limiting & Headers");
  resetRateLimitStores();
  process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX = "3";
  process.env.RATE_LIMIT_AUTH_IP_MAX = "20";

  const targetEmail = "testuser@planora.app";

  for (let i = 1; i <= 3; i++) {
    const { req, res, getHeaders, getStatus } = createMockReqRes({ body: { email: targetEmail } });
    let nextCalled = false;
    authRateLimiter(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true, `Request ${i} should be allowed`);
    assert.strictEqual(getStatus(), 200);
    assert.strictEqual(getHeaders()["x-ratelimit-limit-account"], 3);
    assert.strictEqual(getHeaders()["x-ratelimit-remaining-account"], 3 - i);
  }

  // 4th request should exceed account limit and trigger 429
  const { req: req4, res: res4, getHeaders: getHeaders4, getStatus: getStatus4, getBody: getBody4 } = createMockReqRes({ body: { email: targetEmail } });
  let nextCalled4 = false;
  authRateLimiter(req4, res4, () => { nextCalled4 = true; });

  assert.strictEqual(nextCalled4, false, "4th request should be blocked");
  assert.strictEqual(getStatus4(), 429, "Status should be 429");
  assert.strictEqual(getBody4().limitType, "account");
  assert.ok(getHeaders4()["retry-after"], "Retry-After header must be present");
  console.log("  ✓ Per-Account rate limit enforced & 429 Retry-After triggered.\n");

  // 3. Test Successful Auth Resets Account Attempt Count
  console.log("▶ Test 3: Successful Login Resets Account Counter");
  const { req: successReq, res: successRes, triggerFinish } = createMockReqRes({ body: { email: targetEmail } });
  authRateLimiter(successReq, successRes, () => {});
  successRes.status(200);
  triggerFinish();

  // Next request should now be allowed again
  const { req: reqAfterReset, res: resAfterReset, getStatus: getStatusAfterReset } = createMockReqRes({ body: { email: targetEmail } });
  let nextCalledAfterReset = false;
  authRateLimiter(reqAfterReset, resAfterReset, () => { nextCalledAfterReset = true; });
  assert.strictEqual(nextCalledAfterReset, true, "Request should be allowed after successful auth reset");
  console.log("  ✓ Account attempt count reset on HTTP 2xx success verified.\n");

  // 4. Test Public Endpoint Rate Limiter
  console.log("▶ Test 4: Public Endpoint Rate Limiting");
  resetRateLimitStores();
  process.env.RATE_LIMIT_PUBLIC_MAX = "2";

  const publicReq1 = createMockReqRes({ ip: "192.168.1.100" });
  let publicNext1 = false;
  publicRateLimiter(publicReq1.req, publicReq1.res, () => { publicNext1 = true; });
  assert.strictEqual(publicNext1, true);

  const publicReq2 = createMockReqRes({ ip: "192.168.1.100" });
  let publicNext2 = false;
  publicRateLimiter(publicReq2.req, publicReq2.res, () => { publicNext2 = true; });
  assert.strictEqual(publicNext2, true);

  const publicReq3 = createMockReqRes({ ip: "192.168.1.100" });
  let publicNext3 = false;
  publicRateLimiter(publicReq3.req, publicReq3.res, () => { publicNext3 = true; });
  assert.strictEqual(publicNext3, false);
  assert.strictEqual(publicReq3.getStatus(), 429);
  console.log("  ✓ Public endpoint rate limit enforced.\n");

  // 5. Test Authenticated User Rate Limiter
  console.log("▶ Test 5: Authenticated User Actions Rate Limiting");
  resetRateLimitStores();
  process.env.RATE_LIMIT_AUTHENTICATED_MAX = "2";

  const userReq1 = createMockReqRes({ headers: { authorization: "Bearer token-123" } });
  let userNext1 = false;
  authenticatedRateLimiter(userReq1.req, userReq1.res, () => { userNext1 = true; });
  assert.strictEqual(userNext1, true);

  const userReq2 = createMockReqRes({ headers: { authorization: "Bearer token-123" } });
  let userNext2 = false;
  authenticatedRateLimiter(userReq2.req, userReq2.res, () => { userNext2 = true; });
  assert.strictEqual(userNext2, true);

  const userReq3 = createMockReqRes({ headers: { authorization: "Bearer token-123" } });
  let userNext3 = false;
  authenticatedRateLimiter(userReq3.req, userReq3.res, () => { userNext3 = true; });
  assert.strictEqual(userNext3, false);
  assert.strictEqual(userReq3.getStatus(), 429);
  console.log("  ✓ Authenticated user action rate limit enforced.\n");

  console.log("🎉 All Planora Tiered Rate Limiter Tests Passed Successfully!");
}

runTests().catch(err => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
