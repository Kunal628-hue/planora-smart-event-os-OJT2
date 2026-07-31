import path from "path";
import crypto from "crypto";

/**
 * Magic Number Byte Signatures
 */
const MAGIC_NUMBERS = {
    png: [0x89, 0x50, 0x4e, 0x47],
    jpeg: [0xff, 0xd8, 0xff],
    pdf: [0x25, 0x50, 0x44, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF header
    xlsx: [0x50, 0x4b, 0x03, 0x04], // PK zip header
};

// Forbidden executable signatures & dangerous script tags
const EXECUTABLE_SIGNATURES = [
    [0x4d, 0x5a], // MZ (Windows Portable Executable / DLL)
    [0x7f, 0x45, 0x4c, 0x46], // ELF (Linux Executable)
    [0xca, 0xfe, 0xba, 0xbe], // Java Class File
];

const FORBIDDEN_EXTENSIONS = new Set([
    ".php", ".php3", ".php4", ".php5", ".phtml", ".exe", ".dll", ".so", ".dylib",
    ".sh", ".bash", ".js", ".mjs", ".cjs", ".html", ".htm", ".xhtml", ".svg", ".asp", ".aspx", ".jsp"
]);

const ALLOWED_EXTENSIONS = new Set([
    ".jpg", ".jpeg", ".png", ".webp", ".pdf", ".csv", ".xlsx"
]);

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

/**
 * Inspects file buffer bytes to verify content authenticity against magic numbers.
 * Rejects disguised executables, scripts, or mismatched header signatures.
 */
export const validateFileBufferContent = (buffer, mimetype, originalname) => {
    if (!buffer || buffer.length === 0) {
        return { valid: false, message: "Empty file payload" };
    }

    const ext = path.extname(originalname || "").toLowerCase();
    if (FORBIDDEN_EXTENSIONS.has(ext) || !ALLOWED_EXTENSIONS.has(ext)) {
        return { valid: false, message: `Forbidden or unsupported file extension (${ext})` };
    }

    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
        return { valid: false, message: `Unsupported MIME type (${mimetype})` };
    }

    // Check for executable binary magic numbers
    for (const sig of EXECUTABLE_SIGNATURES) {
        if (buffer.length >= sig.length && sig.every((byte, idx) => buffer[idx] === byte)) {
            return { valid: false, message: "Security violation: Executable binary file content detected" };
        }
    }

    // Verify magic byte headers for image/document types
    if (mimetype === "image/png") {
        const matches = MAGIC_NUMBERS.png.every((b, i) => buffer[i] === b);
        if (!matches) return { valid: false, message: "File header magic numbers do not match PNG image content" };
    } else if (mimetype === "image/jpeg" || mimetype === "image/jpg") {
        const matches = MAGIC_NUMBERS.jpeg.every((b, i) => buffer[i] === b);
        if (!matches) return { valid: false, message: "File header magic numbers do not match JPEG image content" };
    } else if (mimetype === "application/pdf") {
        const matches = MAGIC_NUMBERS.pdf.every((b, i) => buffer[i] === b);
        if (!matches) return { valid: false, message: "File header magic numbers do not match PDF document content" };
    } else if (mimetype === "image/webp") {
        const matches = MAGIC_NUMBERS.webp.every((b, i) => buffer[i] === b);
        if (!matches) return { valid: false, message: "File header magic numbers do not match WEBP image content" };
    } else if (mimetype.includes("spreadsheetml") || mimetype.includes("excel")) {
        const matches = MAGIC_NUMBERS.xlsx.every((b, i) => buffer[i] === b);
        if (!matches) return { valid: false, message: "File header magic numbers do not match Excel spreadsheet content" };
    } else if (mimetype === "text/csv") {
        // Inspect CSV text to ensure no embedded HTML/script tags
        const sampleText = buffer.slice(0, 4096).toString("utf8").toLowerCase();
        if (sampleText.includes("<script") || sampleText.includes("javascript:") || sampleText.includes("<?php")) {
            return { valid: false, message: "Security violation: Embedded scripts detected in CSV payload" };
        }
    }

    return { valid: true };
};

/**
 * Generates a cryptographically random, sanitized filename.
 */
export const generateSanitizedFilename = (originalname) => {
    const ext = path.extname(originalname || "").toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".bin";
    const randomHash = crypto.randomBytes(16).toString("hex");
    return `${Date.now()}-${randomHash}${safeExt}`;
};
