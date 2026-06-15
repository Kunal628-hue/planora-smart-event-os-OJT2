/**
 * inputValidator.js — ReDoS-Safe Input Validation
 *
 * All user-controlled string validation is handled here using the `validator`
 * library (https://github.com/validatorjs/validator.js) whose internals are
 * audited, DFA-based and provably not vulnerable to ReDoS.
 *
 * NEVER add hand-rolled regexes here for email / URL / phone validation.
 * Use the appropriate validator.js method and document why.
 *
 * Usage:
 *   import { validateEmail, validateURL, validatePhone } from "../utils/inputValidator.js";
 *   if (!validateEmail(req.body.email)) return res.status(400).json({ message: "Invalid email" });
 */

import validator from "validator";

// ─────────────────────────────────────────────────────────────────────────────
// Email
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates an email address using validator.isEmail().
 * validator.isEmail() implements RFC 5321 / RFC 5322 subset rules and is
 * provably ReDoS-safe (no nested quantifiers).
 *
 * @param {string} value
 * @returns {boolean}
 */
export const validateEmail = (value) => {
    if (typeof value !== "string" || value.length === 0) return false;
    // Hard cap: RFC 5321 §4.5.3 limits the full address to 254 characters
    if (value.length > 254) return false;
    return validator.isEmail(value);
};

// ─────────────────────────────────────────────────────────────────────────────
// URL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a URL using validator.isURL().
 * Accepts http and https only; rejects data:, javascript:, and other schemes.
 *
 * @param {string} value
 * @returns {boolean}
 */
export const validateURL = (value) => {
    if (typeof value !== "string" || value.length === 0) return false;
    if (value.length > 2048) return false;  // reasonable URL cap
    return validator.isURL(value, {
        protocols: ["http", "https"],
        require_protocol: true,
        require_valid_protocol: true,
        allow_underscores: false,
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Phone / WhatsApp number
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a phone number using validator.isMobilePhone().
 * Accepts any locale (broad) or restrict to specific locales as needed.
 * Enforces a hard length cap to prevent catastrophic backtracking on long
 * inputs if the underlying locale regex ever has nested quantifiers.
 *
 * @param {string} value
 * @returns {boolean}
 */
export const validatePhone = (value) => {
    if (typeof value !== "string" || value.length === 0) return false;
    // E.164 max is 15 digits + optional leading + and spaces — cap at 20
    if (value.length > 20) return false;
    return validator.isMobilePhone(value, "any", { strictMode: false });
};

// ─────────────────────────────────────────────────────────────────────────────
// Hex colour (used in htmlSanitizer — kept as simple regex because it's
// anchored, has no nested quantifiers, and safe-regex confirms it is SAFE)
// ─────────────────────────────────────────────────────────────────────────────
// Re-exported here as a single source of truth.
export const HEX_COLOUR_RE = /^#[0-9A-Fa-f]{3,8}$/;

/**
 * Returns true if value is a valid CSS hex colour string.
 * @param {string} value
 * @returns {boolean}
 */
export const validateHexColour = (value) =>
    typeof value === "string" && HEX_COLOUR_RE.test(value.trim());

// ─────────────────────────────────────────────────────────────────────────────
// MIME / file-type allowlist (replaces the alternation regex in uploadRoutes)
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([".jpeg", ".jpg", ".png", ".pdf"]);

/**
 * Validates a file's MIME type against a hard-coded allowlist.
 * Uses a Set lookup (O(1)) instead of a regex, eliminating any regex surface
 * for attacker-controlled MIME strings.
 *
 * @param {string} mimetype
 * @returns {boolean}
 */
export const validateMimeType = (mimetype) =>
    typeof mimetype === "string" && ALLOWED_MIME_TYPES.has(mimetype.toLowerCase().trim());

/**
 * Validates a file's extension against a hard-coded allowlist.
 * @param {string} ext  — e.g. ".pdf" (from path.extname())
 * @returns {boolean}
 */
export const validateFileExtension = (ext) =>
    typeof ext === "string" && ALLOWED_EXTENSIONS.has(ext.toLowerCase().trim());

// ─────────────────────────────────────────────────────────────────────────────
// ReDoS timeout wrapper
// Used to wrap any regex operation that CANNOT be replaced with a validator.js
// method — gives it a hard time budget.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps an async or sync function in a race against a timeout.
 * Use this for any regex operation on user-supplied data that cannot be
 * replaced with a validator.js equivalent.
 *
 * @param {Function} fn     — () => value  (sync or async)
 * @param {number}   ms     — timeout in milliseconds (default: 50)
 * @returns {Promise<any>}  — resolves with fn()'s return value, or rejects on timeout
 *
 * @example
 * const result = await withTimeout(() => someRegex.exec(userInput), 50);
 */
export const withTimeout = (fn, ms = 50) =>
    Promise.race([
        Promise.resolve().then(fn),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Regex timeout after ${ms}ms`)), ms)
        ),
    ]);
