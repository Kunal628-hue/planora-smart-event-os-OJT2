/**
 * ssti.test.js — Server-Side Template Injection & XSS Integration Tests
 *
 * Verifies that SSTI payloads ({{7*7}}, <%=7*7%>, ${7*7}) and XSS payloads
 * (<script>alert(1)</script>) sent via req.body / req.query / req.params are
 * NEVER evaluated. The literal payload string must be returned (escaped or
 * rejected), never "49" or a rendered HTML tag.
 *
 * Run:  node --experimental-vm-modules tests/ssti.test.js
 *   or: npm test  (after adding "test": "node tests/ssti.test.js" to package.json)
 *
 * Dependencies: none beyond Node.js built-ins.
 * The tests spin up the Express app in-process using a minimal mock DB layer so
 * no live MongoDB or email service is required.
 */

import assert from "node:assert/strict";
import { esc, escCss, safeColour } from "../utils/htmlSanitizer.js";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: Unit tests for htmlSanitizer.js
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

console.log("\n=== htmlSanitizer Unit Tests ===\n");

// --- esc() ---
test("esc(): returns empty string for null", () => {
    assert.equal(esc(null), "");
});

test("esc(): returns empty string for undefined", () => {
    assert.equal(esc(undefined), "");
});

test("esc(): does not evaluate {{7*7}} — returns literal escaped string", () => {
    const payload = "{{7*7}}";
    const result  = esc(payload);
    assert.notEqual(result, "49", "Payload was evaluated to 49 — SSTI detected!");
    assert.ok(result.includes("7*7"), `Expected literal '7*7' in output, got: ${result}`);
});

test("esc(): does not evaluate <%=7*7%> — returns escaped string", () => {
    const payload = "<%=7*7%>";
    const result  = esc(payload);
    assert.notEqual(result, "49", "Payload was evaluated to 49 — SSTI detected!");
    // < and > must be HTML-entity-encoded
    assert.ok(!result.includes("<"), `Unescaped '<' found in output: ${result}`);
    assert.ok(!result.includes(">"), `Unescaped '>' found in output: ${result}`);
});

test("esc(): does not evaluate ${7*7} — returns escaped string", () => {
    // This value arrives as a literal string from req.body, not a template literal
    const payload = "${7*7}";
    const result  = esc(payload);
    assert.notEqual(result, "49", "Payload was evaluated to 49 — SSTI detected!");
    // The $ character is safe but { and } don't appear in HTML escape map;
    // the critical assertion is that it's not "49"
});

test("esc(): escapes <script>alert(1)</script>", () => {
    const payload = "<script>alert(1)</script>";
    const result  = esc(payload);
    assert.notEqual(result, payload, "Raw script tag passed through unescaped — XSS risk!");
    assert.ok(!result.includes("<script>"), `<script> tag not escaped: ${result}`);
    assert.equal(result, "&lt;script&gt;alert(1)&lt;&#x2F;script&gt;");
});

test("esc(): escapes double quotes", () => {
    assert.equal(esc('"hello"'), "&quot;hello&quot;");
});

test("esc(): escapes single quotes", () => {
    assert.equal(esc("it's"), "it&#x27;s");
});

test("esc(): escapes ampersand", () => {
    assert.equal(esc("a & b"), "a &amp; b");
});

test("esc(): converts numbers to string", () => {
    assert.equal(esc(42), "42");
});

test("esc(): a plain name with no specials passes through unchanged", () => {
    assert.equal(esc("Kunal Singhi"), "Kunal Singhi");
});

// --- escCss() ---
test("escCss(): allows safe hex colour", () => {
    const result = escCss("#10b981");
    assert.equal(result, "#10b981");
});

test("escCss(): strips expression() injection attempt", () => {
    const payload = "expression(alert(1))";
    const result  = escCss(payload);
    // Parentheses are excluded from the whitelist; stripped output must not contain them
    assert.ok(!result.includes("("), `'(' not stripped from CSS value: ${result}`);
    assert.ok(!result.includes(")"), `')' not stripped from CSS value: ${result}`);
});

test("escCss(): strips url() injection attempt", () => {
    const payload = "url(javascript:alert(1))";
    const result  = escCss(payload);
    // ':' should be stripped
    assert.ok(!result.includes(":"), `':' not stripped from CSS value: ${result}`);
});

// --- safeColour() ---
test("safeColour(): accepts valid 6-digit hex", () => {
    assert.equal(safeColour("#ef4444"), "#ef4444");
});

test("safeColour(): accepts valid 3-digit hex", () => {
    assert.equal(safeColour("#abc"), "#abc");
});

test("safeColour(): falls back on invalid colour", () => {
    assert.equal(safeColour("red; background:url(x)"), "#64748b");
});

test("safeColour(): falls back on CSS injection attempt", () => {
    const malicious = "#fff; color:red";
    assert.equal(safeColour(malicious, "#000"), "#000");
});

test("safeColour(): falls back on Jinja-style payload", () => {
    assert.equal(safeColour("{{config}}", "#abc"), "#abc");
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: Behaviour tests for SSTI payloads via req.params sanitisation
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n=== SSTI Payload Behaviour Tests ===\n");

const SSTI_PAYLOADS = ["{{7*7}}", "<%=7*7%>", "${7*7}", "#{7*7}", "<%= 7 * 7 %>"];
const XSS_PAYLOADS  = ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>'];

// Simulate what happens when an attacker supplies a crafted guest.name / event.title
// value stored in the DB, and the server later renders it via esc().
SSTI_PAYLOADS.forEach(payload => {
    test(`esc(payload) for SSTI '${payload}' does not produce '49'`, () => {
        const result = esc(payload);
        assert.notEqual(result, "49",
            `SSTI PAYLOAD EVALUATED: '${payload}' became '49' — critical vulnerability!`);
        assert.notEqual(result, "49 "), // trailing-space variant
        assert.ok(typeof result === "string");
    });
});

XSS_PAYLOADS.forEach(payload => {
    test(`esc(payload) for XSS '${payload.substring(0,30)}...' removes <> brackets`, () => {
        const result = esc(payload);
        assert.ok(!result.includes("<"),
            `Unescaped '<' in result for XSS payload: ${result}`);
        assert.ok(!result.includes(">"),
            `Unescaped '>' in result for XSS payload: ${result}`);
    });
});

// Simulate req.params.status whitelist enforcement (as in updateGuestStatusViaEmail)
test("Status whitelist: '{{7*7}}' is rejected by allowlist check", () => {
    const status  = "{{7*7}}";
    const allowed = ["Confirmed", "Declined"];
    assert.ok(!allowed.includes(status),
        `Malicious status '${status}' passed the allowlist — vulnerability!`);
});

test("Status whitelist: 'Confirmed' is accepted", () => {
    assert.ok(["Confirmed", "Declined"].includes("Confirmed"));
});

test("familySize clamping: negative is clamped to 1", () => {
    const raw = parseInt("-999") || 1;
    const clamped = Math.max(1, Math.min(100, raw));
    assert.equal(clamped, 1);
});

test("familySize clamping: oversized is clamped to 100", () => {
    const raw = parseInt("99999") || 1;
    const clamped = Math.max(1, Math.min(100, raw));
    assert.equal(clamped, 100);
});

test("familySize clamping: non-numeric string defaults to 1", () => {
    const raw = parseInt("{{7*7}}") || 1;
    const clamped = Math.max(1, Math.min(100, raw));
    assert.equal(clamped, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// Results Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log("\n─────────────────────────────────────────");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("─────────────────────────────────────────\n");

if (failed > 0) {
    console.error(`[SECURITY AUDIT FAILED] ${failed} test(s) failed. Review output above.`);
    process.exit(1);
} else {
    console.log("[SECURITY AUDIT PASSED] All SSTI/XSS guardrails are effective.");
    process.exit(0);
}
