/**
 * validateInput.js — Joi Schemas & Validation Middleware
 *
 * Central schema registry for every entity in Planora.
 * Each POST/PUT/PATCH route uses a schema-specific middleware that
 * rejects oversized or malformed payloads BEFORE the controller runs.
 *
 * Resource-exhaustion guards:
 *   • Every string has a max length (prevents large-payload attacks)
 *   • Password capped at 128 chars (must be enforced BEFORE bcrypt)
 *   • Numbers are bounded (cost ≤ 10B, familySize ≤ 100)
 *   • Unknown keys are stripped via .options({ stripUnknown: true })
 *
 * Usage in routes:
 *   import { validate, schemas } from "../middleware/validateInput.js";
 *   router.post("/", validate(schemas.event.create), createEvent);
 */

import Joi from "joi";

// ─────────────────────────────────────────────────────────────────────────────
// Common field fragments (reusable across schemas)
// ─────────────────────────────────────────────────────────────────────────────

const fields = {
    // MongoDB ObjectId (24-hex) or Firebase UID (up to 128 chars)
    objectId: Joi.string().max(128).trim(),

    firebaseUid: Joi.string().max(128).trim(),

    email: Joi.string().email({ tlds: { allow: false } }).max(254).trim()
        .pattern(/^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/)
        .messages({ 
            "string.email": "Please provide a valid, proper email address (e.g. name@domain.com)",
            "string.pattern.base": "Please enter a proper email address format (e.g. name@domain.com)"
        }),

    password: Joi.string().min(8).max(128),

    phone: Joi.string().max(20).trim()
        .pattern(/^(\+?[0-9]{1,4}[\s\-]?)?[0-9]{10}$/)
        .messages({ "string.pattern.base": "Phone number must contain a valid 10-digit mobile number (e.g. 9876543210 or +91 9876543210)" }),

    url: Joi.string().uri({ scheme: ["http", "https"] }).max(2048).trim(),

    shortText: (max = 100) => Joi.string().max(max).trim(),
    longText:  (max = 5000) => Joi.string().max(max).trim(),
};

// ─────────────────────────────────────────────────────────────────────────────
// Entity Schemas
// ─────────────────────────────────────────────────────────────────────────────

// ---------- AUTH (OTP flow) ----------
const authSchemas = {
    sendOtp: Joi.object({
        email: fields.email.required(),
    }),
    verifyOtp: Joi.object({
        email: fields.email.required(),
        code: Joi.string().length(6).pattern(/^\d+$/).required()
            .messages({ "string.pattern.base": "OTP code must be 6 digits" }),
    }),
};

// ---------- EVENT ----------
const eventSchemas = {
    create: Joi.object({
        name:        fields.shortText(100).required()
            .messages({ "string.max": "Event name cannot exceed 100 characters" }),
        description: fields.longText(5000).optional().allow(""),
        location:    fields.shortText(200).required(),
        city:        fields.shortText(80).optional(),
        country:     fields.shortText(80).optional(),
        date:        Joi.string().max(50).required(),
        startDate:   Joi.date().iso().optional().allow(""),
        endDate:     Joi.date().iso().min(Joi.ref('startDate')).optional().allow("")
            .messages({ "date.min": "End Date cannot be earlier than Start Date" }),
        userId:      fields.firebaseUid.required(),
        budget:      Joi.number().min(0).max(10_000_000_000).optional(),
        status:      Joi.string().valid("Planned", "Active", "Completed", "Cancelled").optional(),
        type:        fields.shortText(50).optional(),
    }),
    update: Joi.object({
        title:       fields.shortText(100).optional(),
        name:        fields.shortText(100).optional(),
        description: fields.longText(5000).optional().allow(""),
        location:    fields.shortText(200).optional(),
        city:        fields.shortText(80).optional(),
        country:     fields.shortText(80).optional(),
        date:        Joi.string().max(50).optional(),
        startDate:   Joi.date().iso().optional().allow(""),
        endDate:     Joi.date().iso().min(Joi.ref('startDate')).optional().allow("")
            .messages({ "date.min": "End Date cannot be earlier than Start Date" }),
        budget:      Joi.number().min(0).max(10_000_000_000).optional(),
        status:      Joi.string().valid("Planned", "Active", "Completed", "Cancelled").optional(),
        type:        fields.shortText(50).optional(),
        registrationConfig: Joi.object().optional(),
    }).min(1),
};

// ---------- GUEST ----------
const guestSchemas = {
    create: Joi.object({
        name:       fields.shortText(80).required()
            .messages({ "string.max": "Guest name cannot exceed 80 characters" }),
        email:      fields.email.optional(),
        phone:      fields.phone.optional(),
        whatsapp:   fields.phone.optional(),
        status:     Joi.string().valid("Pending", "Confirmed", "Declined", "Rejected").optional(),
        familySize: Joi.number().integer().min(0).max(100).optional(),
        category:   fields.shortText(50).optional(),
        linkedIn:   fields.url.optional().allow(""),
        portfolio:  fields.url.optional().allow(""),
        rejectionReason: fields.longText(1000).optional().allow(""),
        dietary:    fields.shortText(50).optional(),
        notes:      fields.longText(5000).optional().allow(""),
        event:      fields.objectId.required(),
        user:       fields.firebaseUid.optional(),
    }),
    update: Joi.object({
        name:       fields.shortText(80).optional(),
        email:      fields.email.optional(),
        phone:      fields.phone.optional(),
        whatsapp:   fields.phone.optional(),
        status:     Joi.string().valid("Pending", "Confirmed", "Declined", "Rejected").optional(),
        familySize: Joi.number().integer().min(0).max(100).optional(),
        category:   fields.shortText(50).optional(),
        linkedIn:   fields.url.optional().allow(""),
        portfolio:  fields.url.optional().allow(""),
        rejectionReason: fields.longText(1000).optional().allow(""),
        dietary:    fields.shortText(50).optional(),
        notes:      fields.longText(5000).optional().allow(""),
    }).min(1),
    rsvpFinalize: Joi.object({
        familySize: Joi.number().integer().min(1).max(100).optional(),
    }),
};

// ---------- VENDOR ----------
const vendorSchemas = {
    create: Joi.object({
        name:       fields.shortText(80).required()
            .messages({ "string.max": "Vendor name cannot exceed 80 characters" }),
        service:    fields.shortText(80).required(),
        contact:    fields.shortText(200).optional().allow(""),
        email:      fields.email.optional().allow(""),
        cost:       Joi.number().min(0).max(10_000_000_000).optional(),
        status:     Joi.string().valid("Inquiry", "Booked", "Paid", "Unpaid", "Pending").optional().allow(""),
        receiptUrl: fields.url.optional().allow(""),
        event:      fields.objectId.required(),
        user:       fields.firebaseUid.optional().allow(""),
        eventId:    fields.objectId.optional().allow(""),
    }),
    update: Joi.object({
        name:       fields.shortText(80).optional(),
        service:    fields.shortText(80).optional(),
        contact:    fields.shortText(200).optional().allow(""),
        email:      fields.email.optional().allow(""),
        cost:       Joi.number().min(0).max(10_000_000_000).optional(),
        status:     Joi.string().valid("Inquiry", "Booked", "Paid", "Unpaid", "Pending").optional().allow(""),
        receiptUrl: fields.url.optional().allow(""),
        event:      fields.objectId.optional().allow(""),
        user:       fields.firebaseUid.optional().allow(""),
        eventId:    fields.objectId.optional().allow(""),
    }).min(1),
};


// ---------- TASK ----------
const taskSchemas = {
    create: Joi.object({
        title:       fields.shortText(100).required(),
        description: fields.longText(5000).optional().allow(""),
        dueDate:     Joi.string().max(50).optional().allow(""),
        priority:    Joi.string().valid("Low", "Medium", "High").optional(),
        status:      Joi.string().valid("To Do", "In Progress", "Completed", "Pending").optional(),
        event:       fields.objectId.required(),
        user:        fields.firebaseUid.optional(),
        budget:      Joi.number().min(0).max(10_000_000_000).optional(),
    }),
    update: Joi.object({
        title:       fields.shortText(100).optional(),
        description: fields.longText(5000).optional().allow(""),
        dueDate:     Joi.string().max(50).optional().allow(""),
        priority:    Joi.string().valid("Low", "Medium", "High").optional(),
        status:      Joi.string().valid("To Do", "In Progress", "Completed", "Pending").optional(),
        budget:      Joi.number().min(0).max(10_000_000_000).optional(),
    }).min(1),
};

// ---------- COLLABORATOR ----------
const collaboratorSchemas = {
    create: Joi.object({
        name:        fields.shortText(80).required(),
        email:       fields.email.required(),
        role:        Joi.string().valid("Event Lead", "Editor", "Viewer").required(),
        permissions: fields.longText(500).optional().allow(""),
        whatsapp:    fields.phone.optional(),
        user:        fields.firebaseUid.required(),
        event:       fields.objectId.optional(),
        inviterName: fields.shortText(80).optional(),
    }),
    update: Joi.object({
        name:        fields.shortText(80).optional(),
        email:       fields.email.optional(),
        role:        Joi.string().valid("Event Lead", "Editor", "Viewer").optional(),
        permissions: fields.longText(500).optional().allow(""),
        whatsapp:    fields.phone.optional(),
        status:      Joi.string().valid("Active", "Inactive").optional(),
    }).min(1),
};

// ---------- AI CHAT / STRATEGIC PLAN ----------
const aiSchemas = {
    chat: Joi.object({
        message: Joi.string().max(5000).required(),
        eventId: fields.objectId.optional(),
    }),
    applyPlan: Joi.object({
        eventId: fields.objectId.required(),
        userId:  fields.firebaseUid.required(),
        plan:    Joi.object().required(), // AI-generated plan structure
    }),
};

// ---------- USER / PROFILE (future-proof for password auth) ----------
const userSchemas = {
    register: Joi.object({
        email:    fields.email.required(),
        password: fields.password.required(),
        name:     fields.shortText(80).optional(),
    }),
    login: Joi.object({
        email:    fields.email.required(),
        password: fields.password.required(),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Export all schemas as a single registry
// ─────────────────────────────────────────────────────────────────────────────

export const schemas = {
    auth:         authSchemas,
    event:        eventSchemas,
    guest:        guestSchemas,
    vendor:       vendorSchemas,
    task:         taskSchemas,
    collaborator: collaboratorSchemas,
    ai:           aiSchemas,
    user:         userSchemas,
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation Middleware Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns Express middleware that validates req.body against the given Joi schema.
 *
 * On failure: returns 400 with a structured error listing every violation.
 * On success: replaces req.body with the validated (and sanitised) value,
 *             then calls next().
 *
 * Options:
 *   - stripUnknown: true   → silently removes keys not in the schema
 *   - abortEarly:   false  → collects ALL errors, not just the first
 *
 * @param {Joi.ObjectSchema} schema — a Joi schema object
 * @returns {Function} Express middleware
 *
 * @example
 *   router.post("/", validate(schemas.event.create), createEvent);
 */
export const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: false,
        errors: { wrap: { label: false } },
    });

    if (error) {
        const details = error.details.map((d) => ({
            field:   d.path.join("."),
            message: d.message,
        }));
        return res.status(400).json({
            message: "Validation failed",
            errors:  details,
        });
    }

    // Replace req.body with the strictly validated payload
    req.body = value;
    next();
};
