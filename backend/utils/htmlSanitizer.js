/**
 * htmlSanitizer.js — Security Utility
 *
 * Provides a strict HTML-escaping function for all user/database-sourced values
 * that are interpolated into server-rendered HTML strings. This prevents
 * Cross-Site Scripting (XSS) and eliminates Server-Side Template Injection (SSTI)
 * vectors caused by embedding unescaped data into res.send() HTML responses.
 *
 * Usage:
 *   import { esc } from "../utils/htmlSanitizer.js";
 *   res.send(`<p>${esc(guest.name)}</p>`);
 */

const HTML_ESCAPE_MAP = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;",
    "=": "&#x3D;",
    "/": "&#x2F;",
};

/**
 * Escapes a value for safe interpolation into HTML attribute values and text content.
 * Converts all potentially dangerous characters into their HTML-entity equivalents.
 *
 * @param {*} value - Any value to be embedded into an HTML string.
 * @returns {string} - A safely escaped string.
 */
export const esc = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char]);
};

/**
 * Escapes a value for safe use inside a CSS property value (e.g. color, border).
 * Allows only alphanumeric characters, spaces, #, ., %, comma, and dash.
 * Parentheses are intentionally excluded to prevent expression() / url() injection.
 *
 * @param {*} value - A CSS value candidate (e.g. a hex color string).
 * @returns {string} - A safely whitelisted CSS value, or empty string if invalid.
 */
export const escCss = (value) => {
    if (value === null || value === undefined) return "";
    // Explicitly EXCLUDE parentheses: blocks expression(...), url(...), etc.
    return String(value).replace(/[^a-zA-Z0-9 #.,%-]/g, "");
};

/**
 * Validates and returns a safe hex colour string.
 * Falls back to the provided default if the input is invalid.
 *
 * @param {string} colour - The colour value to validate.
 * @param {string} fallback - A known-safe fallback hex colour.
 * @returns {string} - A validated hex colour string.
 */
export const safeColour = (colour, fallback = "#64748b") => {
    if (typeof colour === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(colour.trim())) {
        return colour.trim();
    }
    return fallback;
};
