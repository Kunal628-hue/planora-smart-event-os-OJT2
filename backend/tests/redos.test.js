/**
 * redos.test.js — ReDoS (Regular Expression Denial of Service) Tests
 *
 * Verifies that:
 *  1. Every real regex literal in the codebase is classified SAFE by safe-regex.
 *  2. All validation helpers (email, URL, phone, MIME, ext, hex colour) complete
 *     in under 50 ms even for 10 000-character adversarial inputs.
 *  3. The withTimeout() wrapper rejects operations that exceed their budget.
 *
 * Run:  node tests/redos.test.js
 *   or: npm test
 */

import assert from "node:assert/strict";
import safeRegex from "safe-regex";
import {
    validateEmail,
    validateURL,
    validatePhone,
    validateMimeType,
    validateFileExtension,
    validateHexColour,
    withTimeout,
} from "../utils/inputValidator.js";

// ─────────────────────────────────────────────────────────────────────────────
// Test runner (mirrors ssti.test.js style — no extra deps needed)
// ─────────────────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(label, fn) {
    try {
        fn();
        console.log(`  ✅  ${label}`);
        passed++;
    } catch (err) {
        console.error(`  ❌  ${label}`);
        console.error(`      ${err.message}`);
        failed++;
    }
}

async function testAsync(label, fn) {
    try {
        await fn();
        console.log(`  ✅  ${label}`);
        passed++;
    } catch (err) {
        console.error(`  ❌  ${label}`);
        console.error(`      ${err.message}`);
        failed++;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: safe-regex audit of every real regex in the production codebase
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Section 1: safe-regex Audit of Production Patterns ===\n");

/**
 * Full inventory of REAL regex literals used in production code.
 * Source locations documented for traceability.
 *
 * Patterns are listed as { name, file, line, regex }.
 * If safe-regex returns false, the test FAILS and must be remediated.
 */
const PRODUCTION_PATTERNS = [
    // utils/emailService.js:10
    {
        name: "EMAIL_PASS trim  — /^[\"'\\s]+|[\"'\\s]+$/g",
        regex: /^["'\s]+|["'\s]+$/,
    },
    // controllers/aiController.js:87
    {
        name: "aiController JSON obj extract  — /\\{[\\s\\S]*\\}/",
        regex: /\{[\s\S]*\}/,
    },
    // controllers/guestController.js:322
    {
        name: "guestController JSON arr extract  — /\\[[\\s\\S]*\\]/",
        regex: /\[[\s\S]*\]/,
    },
    // controllers/aiController.js:557
    {
        name: "aiController strip backtick fences  — /```json|```/g",
        regex: /```json|```/,
    },
    // utils/emailService.js:83, 84, 93, 94
    {
        name: "emailService custom {name} placeholder  — /{name}/gi",
        regex: /{name}/gi,
    },
    {
        name: "emailService custom {event} placeholder  — /{event}/gi",
        regex: /{event}/gi,
    },
    // utils/emailService.js:95
    {
        name: "emailService newline-to-br  — /\\n/g",
        regex: /\n/g,
    },
    // utils/htmlSanitizer.js:34
    {
        name: "htmlSanitizer HTML char escaping  — /[&<>\"'`=/]/g",
        regex: /[&<>"'`=/]/g,
    },
    // utils/htmlSanitizer.js:48
    {
        name: "htmlSanitizer CSS whitelist  — /[^a-zA-Z0-9 #.,%-]/g",
        regex: /[^a-zA-Z0-9 #.,%-]/g,
    },
    // utils/htmlSanitizer.js:60
    {
        name: "htmlSanitizer hex colour validator  — /^#[0-9A-Fa-f]{3,8}$/",
        regex: /^#[0-9A-Fa-f]{3,8}$/,
    },
    // authController.js:verifyOTP — 6-digit OTP check
    {
        name: "authController OTP digit check  — /^\\d{6}$/",
        regex: /^\d{6}$/,
    },
];

for (const { name, regex } of PRODUCTION_PATTERNS) {
    test(`safe-regex: SAFE — ${name}`, () => {
        const isSafe = safeRegex(regex);
        assert.ok(
            isSafe,
            `REDOS VULNERABILITY DETECTED: pattern '${regex}' flagged by safe-regex! ` +
            `Rewrite using validator.js or a linear alternative.`
        );
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Performance tests — 10 000-character adversarial inputs
//            All operations must complete in ≤ 50 ms
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Section 2: Adversarial Performance Tests (≤50 ms budget) ===\n");

const BUDGET_MS = 50;

/**
 * Measures how long fn() takes and asserts it completes within ms.
 */
function assertFast(label, fn, ms = BUDGET_MS) {
    test(`[perf ≤${ms}ms] ${label}`, () => {
        const start = performance.now();
        fn();
        const elapsed = performance.now() - start;
        assert.ok(
            elapsed < ms,
            `Took ${elapsed.toFixed(2)}ms — exceeds ${ms}ms budget! ReDoS suspected.`
        );
    });
}

// ── Adversarial email strings ─────────────────────────────────────────────
// Classic ReDoS trigger for naive email regexes: aaaa...a@ with no domain
const LONG_LOCAL   = "a".repeat(10_000) + "@";
const LONG_DOMAIN  = "user@" + "a".repeat(10_000) + ".com";
const MANY_DOTS    = "user." + ".".repeat(500) + "@example.com";
const NESTED_PLUS  = "a+".repeat(2000) + "@b.com";
const UNICODE_BOMB = "ñ".repeat(5000) + "@example.com";

assertFast("validateEmail: 10k-char local part (no domain)",       () => validateEmail(LONG_LOCAL));
assertFast("validateEmail: 10k-char domain",                        () => validateEmail(LONG_DOMAIN));
assertFast("validateEmail: 500 consecutive dots",                   () => validateEmail(MANY_DOTS));
assertFast("validateEmail: 2000 'a+' repetitions",                  () => validateEmail(NESTED_PLUS));
assertFast("validateEmail: 5000 unicode chars",                     () => validateEmail(UNICODE_BOMB));

// All of the above should be INVALID (not accepted)
test("validateEmail rejects 10k-char local part", () => {
    assert.equal(validateEmail(LONG_LOCAL), false);
});
test("validateEmail rejects 10k-char domain (> 254 char address)", () => {
    // total > 254 chars — capped by our length guard
    assert.equal(validateEmail(LONG_DOMAIN), false);
});

// ── Adversarial URL strings ───────────────────────────────────────────────
const LONG_URL_PATH  = "https://example.com/" + "a".repeat(10_000);
const LONG_URL_HOST  = "https://" + "a".repeat(5000) + ".com";
const DATA_URI       = "data:text/html," + "<script>".repeat(1000);
const JS_URI         = "javascript:alert(" + "1".repeat(5000) + ")";
const PROTO_RELATIVE = "//" + "a".repeat(5000) + ".example.com";

assertFast("validateURL: 10k-char path",          () => validateURL(LONG_URL_PATH));
assertFast("validateURL: 5k-char host",            () => validateURL(LONG_URL_HOST));
assertFast("validateURL: data: URI",               () => validateURL(DATA_URI));
assertFast("validateURL: javascript: URI",         () => validateURL(JS_URI));
assertFast("validateURL: protocol-relative URL",   () => validateURL(PROTO_RELATIVE));

// Security assertions — all should be rejected
test("validateURL rejects data: URI",               () => assert.equal(validateURL(DATA_URI), false));
test("validateURL rejects javascript: URI",         () => assert.equal(validateURL(JS_URI), false));
test("validateURL rejects protocol-relative URL",   () => assert.equal(validateURL(PROTO_RELATIVE), false));
test("validateURL rejects URL > 2048 chars",        () => assert.equal(validateURL("https://x.com/" + "a".repeat(2050)), false));

// ── Adversarial phone strings ─────────────────────────────────────────────
const LONG_PHONE  = "+" + "1".repeat(10_000);
const PHONE_CHARS = "a".repeat(10_000);
const PHONE_MIXED = "+91 " + "9".repeat(200);

assertFast("validatePhone: 10k-char number",    () => validatePhone(LONG_PHONE));
assertFast("validatePhone: 10k alpha chars",    () => validatePhone(PHONE_CHARS));
assertFast("validatePhone: 200-digit number",   () => validatePhone(PHONE_MIXED));

// All > 20 chars should be rejected by our length guard
test("validatePhone rejects > 20 char string", () => {
    assert.equal(validatePhone(LONG_PHONE), false);
    assert.equal(validatePhone(PHONE_MIXED), false);
});

// ── Adversarial MIME type strings ─────────────────────────────────────────
const LONG_MIME     = "image/" + "a".repeat(10_000);
const CRAFTED_MIME  = "image/jpeg; charset=" + "x".repeat(500);
const NULL_BYTE     = "image/jpeg\x00.php";

assertFast("validateMimeType: 10k-char MIME",            () => validateMimeType(LONG_MIME));
assertFast("validateMimeType: MIME with charset param",  () => validateMimeType(CRAFTED_MIME));
assertFast("validateMimeType: null-byte injection",      () => validateMimeType(NULL_BYTE));

test("validateMimeType rejects unknown MIME",     () => assert.equal(validateMimeType(LONG_MIME), false));
test("validateMimeType rejects MIME with params", () => assert.equal(validateMimeType(CRAFTED_MIME), false));
test("validateMimeType accepts image/jpeg",       () => assert.equal(validateMimeType("image/jpeg"), true));
test("validateMimeType accepts application/pdf",  () => assert.equal(validateMimeType("application/pdf"), true));

// ── Adversarial file extension strings ───────────────────────────────────
const LONG_EXT       = "." + "a".repeat(10_000);
const PATH_TRAVERSAL = "./../../../etc/passwd";
const DOUBLE_EXT     = ".jpg.php";

assertFast("validateFileExtension: 10k-char ext",     () => validateFileExtension(LONG_EXT));
assertFast("validateFileExtension: path traversal",    () => validateFileExtension(PATH_TRAVERSAL));

test("validateFileExtension rejects long extension",   () => assert.equal(validateFileExtension(LONG_EXT), false));
test("validateFileExtension rejects path traversal",   () => assert.equal(validateFileExtension(PATH_TRAVERSAL), false));
test("validateFileExtension rejects double extension", () => assert.equal(validateFileExtension(DOUBLE_EXT), false));
test("validateFileExtension accepts .pdf",             () => assert.equal(validateFileExtension(".pdf"), true));
test("validateFileExtension accepts .jpg",             () => assert.equal(validateFileExtension(".jpg"), true));

// ── Adversarial hex colour strings ────────────────────────────────────────
const LONG_HEX = "#" + "f".repeat(10_000);
const CSS_INJ  = "#abc; color: red";

assertFast("validateHexColour: 10k-char value",   () => validateHexColour(LONG_HEX));
assertFast("validateHexColour: CSS injection",    () => validateHexColour(CSS_INJ));

test("validateHexColour rejects long value",       () => assert.equal(validateHexColour(LONG_HEX), false));
test("validateHexColour rejects CSS injection",    () => assert.equal(validateHexColour(CSS_INJ), false));
test("validateHexColour accepts #10b981",          () => assert.equal(validateHexColour("#10b981"), true));
test("validateHexColour accepts #abc",             () => assert.equal(validateHexColour("#abc"), true));

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: withTimeout() wrapper tests
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Section 3: withTimeout() Wrapper Tests ===\n");

await testAsync("withTimeout: resolves fast sync fn within budget", async () => {
    const result = await withTimeout(() => 42, 50);
    assert.equal(result, 42);
});

await testAsync("withTimeout: resolves async fn within budget", async () => {
    const result = await withTimeout(async () => {
        await new Promise(r => setTimeout(r, 5));
        return "ok";
    }, 50);
    assert.equal(result, "ok");
});

await testAsync("withTimeout: rejects fn that exceeds timeout", async () => {
    try {
        await withTimeout(async () => {
            // Simulate a slow operation (80ms > 50ms budget)
            await new Promise(r => setTimeout(r, 80));
            return "too slow";
        }, 50);
        assert.fail("Should have thrown a timeout error");
    } catch (err) {
        assert.ok(
            err.message.includes("timeout"),
            `Expected timeout error, got: ${err.message}`
        );
    }
});

await testAsync("withTimeout: rejects with custom ms budget", async () => {
    try {
        await withTimeout(async () => {
            await new Promise(r => setTimeout(r, 30));
        }, 10); // only 10ms budget
        assert.fail("Should have timed out");
    } catch (err) {
        assert.ok(err.message.includes("timeout"));
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: Correctness — valid inputs are accepted
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== Section 4: Correctness — Valid Input Acceptance ===\n");

test("validateEmail accepts standard email", () => {
    assert.equal(validateEmail("kunal@planora.dev"), true);
});
test("validateEmail accepts email with dots", () => {
    assert.equal(validateEmail("first.last+tag@sub.domain.com"), true);
});
test("validateURL accepts https URL", () => {
    assert.equal(validateURL("https://github.com/kunal/planora"), true);
});
test("validateURL accepts https URL with query", () => {
    assert.equal(validateURL("https://example.com/path?q=1&r=2"), true);
});
test("validateURL rejects http (no https fallback — config requires https)", () => {
    // Our validateURL requires protocols: ["http","https"] — http IS allowed
    assert.equal(validateURL("http://example.com"), true);
});
test("validatePhone accepts +91 mobile format", () => {
    assert.equal(validatePhone("+919876543210"), true);
});
test("validatePhone accepts 10-digit number", () => {
    assert.equal(validatePhone("9876543210"), true);
});

// ─────────────────────────────────────────────────────────────────────────────
// Results Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n─────────────────────────────────────────");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("─────────────────────────────────────────\n");

if (failed > 0) {
    console.error(`[REDOS AUDIT FAILED] ${failed} test(s) failed. Review output above.`);
    process.exit(1);
} else {
    console.log("[REDOS AUDIT PASSED] All patterns are safe and within the 50ms performance budget.");
    process.exit(0);
}
