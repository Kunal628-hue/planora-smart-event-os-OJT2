import assert from "assert";
import { handleControllerError } from "../utils/errorHandler.js";

// Helper to create mock Express res
function createMockRes() {
  let statusCode = 200;
  let responseJson = null;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseJson = data;
      return res;
    }
  };

  return { res, getStatus: () => statusCode, getJson: () => responseJson };
}

async function runTests() {
  console.log("🧪 Starting Error Handling & Data Leak Prevention Test Suite...\n");

  // 1. Test handleControllerError masks raw database error messages
  console.log("▶ Test 1: Masking Raw Database & Stack Trace Errors");
  const { res: res1, getStatus: getStatus1, getJson: getJson1 } = createMockRes();

  const rawDatabaseError = new Error("MongoServerError: E11000 duplicate key error collection: planora.users index: email_1 dup key: { email: 'admin@planora.app' } at /Users/kunalsinghi/node_modules/mongoose/lib/drivers/node-mongodb-native/collection.js:150:11");
  rawDatabaseError.stack = "Error: MongoServerError at /Users/kunalsinghi/backend/server.js:45:12";

  handleControllerError(res1, rawDatabaseError, "Failed to create account. Please try again.", 500);

  assert.strictEqual(getStatus1(), 500, "Should return status 500");
  assert.strictEqual(getJson1().message, "Failed to create account. Please try again.");
  assert.strictEqual(getJson1().stack, undefined, "Stack trace must NEVER be sent to client");
  assert.strictEqual(getJson1().systemDetail, undefined, "Raw system details must NEVER be sent to client");
  assert.ok(!JSON.stringify(getJson1()).includes("/Users/kunalsinghi"), "Internal file paths must NOT be present in response");
  assert.ok(!JSON.stringify(getJson1()).includes("MongoServerError"), "Raw database driver error string must NOT be present in response");
  console.log("  ✓ Raw database details, stack traces, and internal file paths strictly masked.\n");

  // 2. Test handleControllerError default fallback message
  console.log("▶ Test 2: Default Generic Error Fallback Message");
  const { res: res2, getStatus: getStatus2, getJson: getJson2 } = createMockRes();
  const genericErr = new TypeError("Cannot read properties of undefined (reading 'id')");

  handleControllerError(res2, genericErr);

  assert.strictEqual(getStatus2(), 500);
  assert.strictEqual(getJson2().message, "An unexpected error occurred. Please try again later.");
  console.log("  ✓ Default fallback message returned safely.\n");

  console.log("🎉 All Error Handling & Data Leak Prevention Tests Passed Successfully!");
}

runTests().catch(err => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
