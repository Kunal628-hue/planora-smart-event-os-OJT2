/**
 * validation.js — Central Frontend Validation Utilities
 *
 * Provides strict, user-friendly validators for:
 * 1. Strict Email format validation (proper RFC compliant format)
 * 2. Strict 10-Digit Phone / WhatsApp validation
 * 3. Calendar Date Range validation (StartDate vs EndDate)
 */

/**
 * Validates an email address strictly.
 * @param {string} email
 * @param {boolean} required
 * @returns {{ valid: boolean, message: string }}
 */
export function validateEmail(email, required = true) {
    if (!email || !email.trim()) {
        if (required) {
            return { valid: false, message: "Email address is required." };
        }
        return { valid: true, message: "" };
    }

    const trimmed = email.trim();

    // Check for space
    if (/\s/.test(trimmed)) {
        return { valid: false, message: "Email address cannot contain spaces." };
    }

    // Strict Email Pattern:
    // Requires alphanumeric start, no consecutive dots in local part, '@', valid domain name, and TLD of at least 2 chars.
    const strictEmailRegex = /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

    if (!strictEmailRegex.test(trimmed)) {
        return { 
            valid: false, 
            message: "Please enter a proper email address format (e.g., alex@example.com)." 
        };
    }

    return { valid: true, message: "" };
}

/**
 * Validates a phone / WhatsApp number strictly for 10 digits.
 * Supports optional leading '+' country code (e.g., +91 9876543210 or 9876543210).
 *
 * @param {string} phone
 * @param {boolean} required
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePhone(phone, required = false) {
    if (!phone || !phone.trim()) {
        if (required) {
            return { valid: false, message: "Phone number is required." };
        }
        return { valid: true, message: "" };
    }

    const trimmed = phone.trim();

    // Check for alphabetic characters or invalid symbols
    if (/[a-zA-Z]/.test(trimmed)) {
        return { valid: false, message: "Phone number cannot contain letters." };
    }

    // Extract digits only
    const digitsOnly = trimmed.replace(/[^0-9]/g, "");

    // If string starts with +, user typed country code (e.g. +91 9876543210 -> 12 digits, or +1 9876543210 -> 11 digits)
    if (trimmed.startsWith("+")) {
        // Must have at least 11 digits (1-3 country code + 10 digit number)
        if (digitsOnly.length < 11 || digitsOnly.length > 14) {
            return { 
                valid: false, 
                message: "Phone number with country code must contain a 10-digit mobile number (e.g., +91 9876543210)." 
            };
        }
        // Extract subscriber part (last 10 digits)
        const subscriberNumber = digitsOnly.slice(-10);
        if (subscriberNumber.length !== 10) {
            return { valid: false, message: "Please enter a valid 10-digit mobile number." };
        }
    } else {
        // Without leading +, strictly require 10 digits (or 12 if starts with 91, 11 if starts with 1)
        if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
            // Valid 10 digit number with 91 prefix
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
            // Valid 10 digit number with leading 0 trunk code
        } else if (digitsOnly.length !== 10) {
            return { 
                valid: false, 
                message: `Phone number must be exactly 10 digits (you typed ${digitsOnly.length} digits). Example: 9876543210.` 
            };
        }
    }

    // Final pattern check for valid formatting
    const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;
    if (!phoneRegex.test(trimmed)) {
        return { 
            valid: false, 
            message: "Invalid phone format. Please enter a valid 10-digit phone number." 
        };
    }

    return { valid: true, message: "" };
}

/**
 * Validates Start Date and End Date logic.
 * Enforces rule: End Date CANNOT be prior to Start Date.
 * Example: Start Date 2026-03-01 and End Date 2026-02-01 is INVALID.
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {{ valid: boolean, message: string }}
 */
export function validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
        return { valid: true, message: "" };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
        return { valid: false, message: "Start Date is an invalid date." };
    }

    if (isNaN(end.getTime())) {
        return { valid: false, message: "End Date is an invalid date." };
    }

    // Zero out time components for date-only comparison
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

    if (endDay < startDay) {
        const startFormatted = start.toLocaleDateString();
        const endFormatted = end.toLocaleDateString();
        return {
            valid: false,
            message: `Invalid Date Range! End Date (${endFormatted}) cannot be earlier than Start Date (${startFormatted}).`
        };
    }

    return { valid: true, message: "" };
}

/**
 * Returns a minimum date string YYYY-MM-DD suitable for input min attribute.
 * @param {string|Date} startDate
 * @returns {string} YYYY-MM-DD
 */
export function getMinEndDate(startDate) {
    if (!startDate) return "";
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return "";
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
