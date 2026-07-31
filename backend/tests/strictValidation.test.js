import assert from "assert";
import { validate, schemas } from "../middleware/validateInput.js";

// Helper to create mock Express req/res
function createMockReqRes(body = {}) {
  const req = { body };
  let statusCode = 200;
  let responseData = null;
  let nextCalled = false;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    }
  };

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getStatus: () => statusCode, getData: () => responseData, wasNextCalled: () => nextCalled };
}

async function runTests() {
  console.log("🧪 Running Strict Input Validation Test Suite...\n");

  // 1. Rejection of Unknown Keys (allowUnknown: false)
  console.log("▶ Test 1: Rejection of Unknown/Extra Body Properties");
  const { req: req1, res: res1, next: next1, getStatus: getStatus1, getData: getData1, wasNextCalled: wasNextCalled1 } = createMockReqRes({
    email: "valid@planora.app",
    password: "Password123!", // pragma: allowlist secret
    maliciousExtraField: "DROP TABLE users;"
  });

  const middleware1 = validate(schemas.user.register);
  middleware1(req1, res1, next1);

  assert.strictEqual(wasNextCalled1(), false, "Request with unknown fields must be rejected");
  assert.strictEqual(getStatus1(), 400, "Must return HTTP 400 Bad Request");
  assert.strictEqual(getData1().message, "Validation failed");
  assert.ok(getData1().errors.some(e => e.field === "maliciousExtraField"), "Error must cite unexpected extra field");
  console.log("  ✓ Extra/unknown fields strictly rejected with HTTP 400.\n");

  // 2. Rejection of Oversized Length Constraints
  console.log("▶ Test 2: Rejection of Oversized Field Lengths");
  const { req: req2, res: res2, next: next2, getStatus: getStatus2, wasNextCalled: wasNextCalled2 } = createMockReqRes({
    email: "user@planora.app",
    password: "a".repeat(200) // Max allowed is 128
  });

  const middleware2 = validate(schemas.user.register);
  middleware2(req2, res2, next2);

  assert.strictEqual(wasNextCalled2(), false, "200-char password must be rejected");
  assert.strictEqual(getStatus2(), 400, "Must return HTTP 400 Bad Request");
  console.log("  ✓ Password > 128 chars strictly rejected before controller execution.\n");

  // 3. Rejection of Malformed Formats (OTP & Email)
  console.log("▶ Test 3: Rejection of Malformed OTP & Email Formats");
  const { req: req3, res: res3, next: next3, getStatus: getStatus3, wasNextCalled: wasNextCalled3 } = createMockReqRes({
    email: "not-an-email",
    code: "123" // Must be 6 digits
  });

  const middleware3 = validate(schemas.auth.verifyOtp);
  middleware3(req3, res3, next3);

  assert.strictEqual(wasNextCalled3(), false, "Invalid email & 3-digit OTP must be rejected");
  assert.strictEqual(getStatus3(), 400);
  console.log("  ✓ Malformed email and OTP formats strictly rejected with 400.\n");

  // 4. Acceptance of Valid Inputs
  console.log("▶ Test 4: Acceptance of Valid Schema Payloads");
  const validBody = {
    email: "valid@planora.app",
    code: "654321"
  };
  const { req: req4, res: res4, next: next4, getStatus: getStatus4, wasNextCalled: wasNextCalled4 } = createMockReqRes({ ...validBody });

  const middleware4 = validate(schemas.auth.verifyOtp);
  middleware4(req4, res4, next4);

  assert.strictEqual(wasNextCalled4(), true, "Valid payload must pass validation");
  assert.strictEqual(getStatus4(), 200);
  assert.deepStrictEqual(req4.body, validBody);
  console.log("  ✓ Valid matching payloads pass smoothly.\n");

  console.log("🎉 All Strict Input Validation Tests Passed Successfully!");
}

runTests().catch(err => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
