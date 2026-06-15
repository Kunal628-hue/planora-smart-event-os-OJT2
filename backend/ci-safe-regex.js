#!/usr/bin/env node
/**
 * ci-safe-regex.js — CI ReDoS Gate
 *
 * Runs safe-regex against every production regex in the Planora backend.
 * Exits with code 1 if any pattern is flagged as potentially ReDoS-vulnerable.
 *
 * Usage (from /backend):
 *   node ci-safe-regex.js
 *
 * Add to CI pipeline:
 *   - run: node backend/ci-safe-regex.js
 *
 * MAINTENANCE: When adding a new regex to any production file, add it here too.
 * If safe-regex flags it, rewrite using validator.js or a provably-linear alternative.
 */

import safeRegex from "safe-regex";

const PATTERNS = [
    // utils/emailService.js:10 — strips surrounding quotes/spaces from env var
    { name: "EMAIL_PASS trim",                       regex: /^["'\s]+|["'\s]+$/ },

    // controllers/aiController.js:87 — extracts first JSON object from AI response
    { name: "aiController JSON object extract",       regex: /\{[\s\S]*\}/ },

    // controllers/guestController.js:322 — extracts first JSON array from AI response
    { name: "guestController JSON array extract",     regex: /\[[\s\S]*\]/ },

    // controllers/aiController.js:557 — strips markdown code fences from AI output
    { name: "aiController markdown fence strip",      regex: /```json|```/ },

    // utils/emailService.js:83,84,93,94 — custom email template placeholders
    { name: "emailService {name} placeholder",        regex: /{name}/gi },
    { name: "emailService {event} placeholder",       regex: /{event}/gi },

    // utils/emailService.js:95 — newline to HTML <br>
    { name: "emailService newline-to-br",             regex: /\n/ },

    // utils/htmlSanitizer.js:34 — HTML entity escaping character class
    { name: "htmlSanitizer HTML char class",          regex: /[&<>"'`=/]/ },

    // utils/htmlSanitizer.js:48 — CSS value character whitelist
    { name: "htmlSanitizer CSS whitelist",            regex: /[^a-zA-Z0-9 #.,%-]/ },

    // utils/htmlSanitizer.js:60 — hex colour validation
    { name: "htmlSanitizer hex colour",               regex: /^#[0-9A-Fa-f]{3,8}$/ },

    // controllers/authController.js:verifyOTP — 6-digit numeric OTP format
    { name: "authController OTP 6-digit check",       regex: /^\d{6}$/ },
];

let hasDanger = false;
let checked   = 0;

console.log("\n╔══════════════════════════════════════════════════════════════╗");
console.log("║         Planora — safe-regex CI Gate (ReDoS Audit)          ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

for (const { name, regex } of PATTERNS) {
    const isSafe = safeRegex(regex);
    const icon   = isSafe ? "✅ SAFE  " : "❌ UNSAFE";
    console.log(`  ${icon}  ${name}`);
    console.log(`           ${regex}`);
    if (!isSafe) {
        hasDanger = true;
        console.error(`\n  ⛔  ACTION REQUIRED: '${name}' may be vulnerable to ReDoS.`);
        console.error(`     Replace with a validator.js method or a provably-linear regex.\n`);
    }
    checked++;
}

console.log(`\n  Checked ${checked} patterns.\n`);

if (hasDanger) {
    console.error("❌  REDOS GATE FAILED — fix unsafe patterns before merging.\n");
    process.exit(1);
} else {
    console.log("✅  REDOS GATE PASSED — all patterns are safe.\n");
    process.exit(0);
}
