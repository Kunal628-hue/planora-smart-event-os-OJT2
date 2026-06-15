import Guest from "../models/Guest.js";
import Event from "../models/Event.js";
import { sendInvitation, sendRejectionMail } from "../utils/emailService.js";
import { getAllowedEventIds } from "../utils/authHelper.js";
import { esc, escCss, safeColour } from "../utils/htmlSanitizer.js";
import { validateEmail, validateURL, validatePhone } from "../utils/inputValidator.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Polyfills for Vercel serverless environment to prevent 'pdf-parse' crash
if (typeof global !== "undefined") {
    if (!global.DOMMatrix) global.DOMMatrix = class DOMMatrix {};
    if (!global.ImageData) global.ImageData = class ImageData {};
    if (!global.Path2D) global.Path2D = class Path2D {};
}
const pdf = require("pdf-parse");
import * as xlsx from "xlsx";
import csv from "csv-parser";
import { Readable } from "stream";
import mongoose from "mongoose";
import fs from "fs";
import crypto from "crypto";

const generateGroqCompletion = async (prompt) => {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

/**
 * Generate a unique 6-character alphanumeric entry code.
 */
const generateEntryCode = () => {
    return crypto.randomBytes(3).toString("hex").toUpperCase(); // e.g., "A7F3B2"
};

export const createGuest = async (req, res) => {
    try {
        const { event: eventId, email, phone, whatsapp, linkedIn, portfolio } = req.body;

        // ── ReDoS-safe field validation ────────────────────────────────────
        if (email && !validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }
        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number" });
        }
        if (whatsapp && !validatePhone(whatsapp)) {
            return res.status(400).json({ message: "Invalid WhatsApp number" });
        }
        if (linkedIn && !validateURL(linkedIn)) {
            return res.status(400).json({ message: "Invalid LinkedIn URL" });
        }
        if (portfolio && !validateURL(portfolio)) {
            return res.status(400).json({ message: "Invalid portfolio URL" });
        }
        // ────────────────────────────────────────────────────────────────────

        const event = await Event.findById(eventId);
        
        // Ensure the item is created under the event owner's namespace
        const guestData = { ...req.body };
        if (event) {
            guestData.user = event.user; 
        }

        // Auto-generate unique entry code
        guestData.entryCode = generateEntryCode();

        const guest = await Guest.create(guestData);
        console.log(`[Operation: Guest Creation] Successfully registered new entity: ${guest.name} (${guest.email || 'No Email'}) | Code: ${guest.entryCode}`);
        
        // If guest has an email, send the invitation
        if (guest.email && event) {
            await sendInvitation(guest, event);
        }

        res.status(201).json(guest);
    } catch (error) {
        console.error("[Guest Creation Failed]", error);
        res.status(500).json({ message: error.message });
    }
};

export const getGuests = async (req, res) => {
    try {
        const { eventId, user, email } = req.query;
        const filter = {};
        if (eventId) {
            filter.event = eventId;
        } else if (user) {
            const allowedIds = await getAllowedEventIds(user, email);
            filter.event = { $in: allowedIds };
        }

        const guests = await Guest.find(filter).sort({ name: 1 });
        res.json(guests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGuest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const originalGuest = await Guest.findById(id);
        if (!originalGuest) return res.status(404).json({ message: "Guest not found" });

        // Handle Rejection Workflow
        if (status === "Rejected") {
            const event = await Event.findById(originalGuest.event);
            const eventName = event ? event.title || event.name : "Upcoming Event";
            
            // Send the polite rejection email
            await sendRejectionMail(originalGuest, eventName);
            
            // Purge the guest after rejection as requested
            await Guest.findByIdAndDelete(id);
            return res.json({ message: "Guest rejected and removed from registry", status: "Rejected" });
        }

        const guest = await Guest.findByIdAndUpdate(id, req.body, { new: true });
        res.json(guest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGuest = async (req, res) => {
    try {
        await Guest.findByIdAndDelete(req.params.id);
        res.json({ message: "Guest removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGuestStatusViaEmail = async (req, res) => {
    try {
        const { id, status } = req.params;
        
        // Only allow whitelisted status values — never reflect raw param into response
        if (!["Confirmed", "Declined"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const guest = await Guest.findById(id);
        if (!guest) {
            return res.status(404).json({ message: "Guest not found" });
        }

        // Escape all DB-sourced values before embedding into HTML
        const safeName = esc(guest.name);
        const safeId   = esc(String(guest._id));
        const appUrl   = esc(process.env.APP_URL || "/");

        if (status === "Declined") {
            await Guest.findByIdAndUpdate(id, { status: "Declined" });
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.send(`
                <div style="font-family: 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f8fafc; height: 100vh;">
                    <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: inline-block; max-width: 400px;">
                        <h1 style="color: #ef4444; margin-bottom: 10px;">Invitation Declined</h1>
                        <p style="color: #64748b;">We&#x27;re sorry you can&#x27;t make it, <strong>${safeName}</strong>. Your response has been recorded.</p>
                        <a href="${appUrl}" style="text-decoration: none; color: #2563eb; font-weight: 600;">Return to Planora</a>
                    </div>
                </div>
            `);
        }

        // If status is Confirmed, show a modern form to capture family size.
        // The form action uses a server-generated ID (MongoDB ObjectId), not user input.
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(`
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f9ff; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0;">
                <div style="background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 50px rgba(37, 99, 235, 0.1); width: 100%; max-width: 450px; border: 1px solid #e0f2fe;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #0369a1; font-size: 28px; font-weight: 800; margin: 0;">Planora RSVP</h1>
                        <p style="color: #64748b; margin-top: 8px;">Yay! We&#x27;re excited to have you, <strong>${safeName}</strong>!</p>
                    </div>
                    
                    <form action="/api/guests/rsvp/finalize/${safeId}" method="POST">
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; font-weight: 600; color: #1e293b; margin-bottom: 10px; font-size: 14px;">Number of people attending?</label>
                            <div style="position: relative;">
                                <input type="number" name="familySize" min="1" max="100" value="1" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; transition: border-color 0.2s; box-sizing: border-box; outline: none;">
                                <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Includes yourself and any family/friends.</p>
                            </div>
                        </div>
                        
                        <button type="submit" style="width: 100%; background: #2563eb; color: white; padding: 16px; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                            Confirm My Attendance
                        </button>
                    </form>
                    
                    <p style="text-align: center; font-size: 12px; color: #cbd5e1; margin-top: 30px;">This response will be instantly updated in the event dashboard.</p>
                </div>
            </div>
        `);
    } catch (error) {
        console.error("[Email Status Update Error]", error);
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};

export const finalizeRSVP = async (req, res) => {
    try {
        const { id } = req.params;
        let { familySize } = req.body;
        
        // Ensure familySize is a valid integer (1-100) — never trust raw user input
        familySize = Math.max(1, Math.min(100, parseInt(familySize) || 1));
        
        const guest = await Guest.findByIdAndUpdate(id, { 
            status: "Confirmed",
            familySize: familySize 
        }, { new: true });

        if (!guest) return res.status(404).json({ message: "Guest not found" });

        // Escape all DB-sourced values before embedding into HTML
        const safeName       = esc(guest.name);
        const safeFamilySize = Number(familySize); // already parseInt-ed above — safe integer

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(`
            <div style="font-family: 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #ecfdf5; margin: 0;">
                <div style="background: white; padding: 50px; border-radius: 30px; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.1); text-align: center; border: 1px solid #d1fae5;">
                    <div style="background: #10b981; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <h1 style="color: #064e3b; margin-bottom: 10px; font-size: 28px;">RSVP Confirmed!</h1>
                    <p style="color: #059669; font-size: 18px; margin: 0;">Thank you, <strong>${safeName}</strong>. We&#x27;ve registered <strong>${safeFamilySize}</strong> people for the event.</p>
                </div>
            </div>
        `);
    } catch (error) {
        console.error("[Finalize RSVP Error]", error);
        res.status(500).json({ message: "Update failed. Please try again." });
    }
};


export const bulkUploadGuests = async (req, res) => {
    try {
        const { eventId } = req.body;
        if (!req.file) return res.status(400).json({ message: "No file provided" });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        let extractedText = "";

        try {
            if (req.file.mimetype === "application/pdf") {
                console.log("[Bulk Upload] Reading PDF...");
                const data = await pdf(req.file.buffer).catch(e => ({ text: "PDF_PARSE_ERROR" }));
                extractedText = data.text;
            } else if (req.file.mimetype.includes("spreadsheet") || req.file.mimetype.includes("excel") || req.file.mimetype.includes("csv") || req.file.originalname.endsWith(".csv")) {
                console.log("[Bulk Upload] Reading Spreadsheet...");
                const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                extractedText = xlsx.utils.sheet_to_csv(sheet);
            } else {
                console.log("[Bulk Upload] Reading Text...");
                extractedText = req.file.buffer.toString();
            }
        } catch (readError) {
            console.error("[Bulk Upload] File read error:", readError);
            return res.status(400).json({ message: "Failed to read file content." });
        }

        if (!extractedText || extractedText === "PDF_PARSE_ERROR") {
            return res.status(400).json({ message: "The file appears to be empty or unreadable." });
        }

        // --- Neural Extraction Strategy ---
        const prompt = `
            Extract guest information from the following text and return it as a raw JSON array of objects.
            Each object MUST have: "name", "email" (optional), "whatsapp" (optional), "category" (Friend, Family, VIP, Business, or Other), "familySize" (default 1), "dietary" (Vegan, Vegetarian, Gluten-Free, or None), "notes" (optional).
            Include "linkedIn" and "portfolio" if found.
            
            IMPORTANT:
            - If you find other columns or custom fields (such as Relationship, Age, GitHub URL, Company, Gift Preference, Special Requests, or general comments), append their names and values clearly into the "notes" string so we do not lose those details.
            
            Text:
            ${extractedText.substring(0, 45000)}

            Return ONLY the valid JSON array. No markdown code blocks, no preamble.
        `;

        let responseText = "";
        let retryCount = 0;
        const maxRetries = 4;
        
        while (retryCount <= maxRetries) {
            try {
                responseText = await generateGroqCompletion(prompt);
                break; // Success
            } catch (aiError) {
                const isRateLimit = aiError.message?.includes("429") || aiError.status === 429;
                
                if (isRateLimit && retryCount < maxRetries) {
                    retryCount++;
                    const waitTime = retryCount * 10000; // 10s, 20s, 30s, 40s
                    console.warn(`[Bulk Upload] Rate limited. Waiting ${waitTime/1000}s then retry ${retryCount}/${maxRetries}...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
                
                console.error("[Bulk Upload] AI error:", aiError);
                if (isRateLimit) {
                    return res.status(429).json({ message: "AI quota exhausted. Please wait 2 minutes and try again." });
                }
                return res.status(500).json({ message: "AI extraction failed." });
            }
        }
        
        // Robust JSON extraction
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error("[Bulk Upload] No JSON found in response:", responseText);
            return res.status(400).json({ message: "The AI could not identify any guests in this file." });
        }
        
        let extractedGuests = [];
        try {
            extractedGuests = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error("[Bulk Upload] JSON parse error:", parseError);
            return res.status(500).json({ message: "Failed to parse AI response." });
        }

        console.log(`[Bulk Upload] Successfully extracted ${extractedGuests.length} potential records.`);

        const createdGuests = [];
        for (const guestData of extractedGuests) {
            try {
                if (!guestData.name) continue;

                const finalGuestData = {
                    ...guestData,
                    event: eventId,
                    user: event.user,
                    status: "Pending"
                };

                // Avoid duplicates only if email is provided
                if (finalGuestData.email) {
                    const existing = await Guest.findOne({ email: finalGuestData.email, event: eventId });
                    if (existing) continue;
                }

                const guest = await Guest.create(finalGuestData);
                createdGuests.push(guest);

                if (guest.email) {
                    await sendInvitation(guest, event);
                }
            } catch (innerError) {
                console.error(`[Bulk Upload] Error creating guest ${guestData.name}:`, innerError);
            }
        }

        res.status(201).json({ 
            message: `Successfully onboarded ${createdGuests.length} guests.`,
            count: createdGuests.length 
        });

    } catch (error) {
        console.error("[Bulk Guest Upload Critical Failure]", error);
        res.status(500).json({ message: "Internal server error during bulk upload." });
    }
};

/**
 * Public Guest Pass Page — no login required.
 * Commercial/College/School events -> show unique entry code for verification.
 * Wedding/Party/Family events -> show a beautiful greeting card.
 */
export const getGuestPass = async (req, res) => {
    try {
        const { id } = req.params;
        const guest = await Guest.findById(id);
        if (!guest) return res.status(404).json({ message: "Pass not found" });

        const event = await Event.findById(guest.event);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // encodeURIComponent is safe for URL context; esc() for HTML context below
        const mapsUrl = event.location
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
            : "";

        // Determine event category
        const eventType = (event.type || "Other").toLowerCase();
        const eventTitle = (event.title || event.name || "").toLowerCase();
        
        const professionalKeywords = ["hackathon", "hackthon", "tech fest", "tech event", "conference", "corporate", "tech summits", "college fest", "seminar", "workshop", "tech", "summit", "meetup"];
        const personalKeywords = ["wedding", "birthday", "party", "anniversary", "baby shower", "engagement", "reception", "family"];
        
        let isProfessional = false;
        if (personalKeywords.some(kw => eventType.includes(kw))) {
            isProfessional = false;
        } else if (professionalKeywords.some(kw => eventType.includes(kw))) {
            isProfessional = true;
        } else {
            isProfessional = professionalKeywords.some(kw => eventTitle.includes(kw)) && !personalKeywords.some(kw => eventTitle.includes(kw));
        }
        
        // Whitelist-validated values used in CSS — must not come from user/DB data
        const SAFE_STATUS_COLOURS = { Confirmed: "#10b981", Declined: "#ef4444", Pending: "#f59e0b" };
        const statusColor = SAFE_STATUS_COLOURS[guest.status] || "#f59e0b";
        const statusLabel = guest.status === "Confirmed" ? "VERIFIED" : guest.status === "Declined" ? "DECLINED" : "PENDING VERIFICATION";

        // Whitelist-validated category colours
        const categoryGlows = {
            "VIP":      { color: "#ec4899", name: "VIP PASS" },
            "Tech":     { color: "#2563eb", name: "TECH SPECIALIST" },
            "Business": { color: "#7c3aed", name: "BUSINESS DELEGATE" },
            "Friend":   { color: "#10b981", name: "GUEST ACCESS" },
            "Family":   { color: "#f43f5e", name: "GUEST ACCESS" }
        };
        // category name comes from DB — HTML-escape before use in HTML text content
        const rawCategory = guest.category || "Guest";
        const categoryConfig = categoryGlows[rawCategory] || {
            color: "#f97316",
            name: `${esc(rawCategory.toUpperCase())} ACCESS`
        };

        // Pre-escape every DB-sourced value used in the HTML response
        const safeGuestName     = esc(guest.name);
        const safeEntryCode     = esc(guest.entryCode || "N/A");
        const safeEventTitle    = esc(event.title || event.name || "Event");
        const safeEventType     = esc(event.type || "Event");
        const safeEventDate     = esc(event.date || "");
        const safeEventCity     = esc(event.city || "TBD");
        const safeEventLocation = esc(event.location || "");
        const safeEventDesc     = esc(event.description || "Welcome to this exclusive event celebration. Use this event pass to optimise networking and secure smooth entry.");
        const safeCategoryName  = esc(categoryConfig.name);
        const safeCategoryColor = safeColour(categoryConfig.color, "#f97316");
        const safeStatusColor   = safeColour(statusColor, "#f59e0b");
        const safeStatusLabel   = esc(statusLabel);
        const safeFamilySize    = Number(guest.familySize || 1);
        const safeGuestCategory = esc(rawCategory);
        const safeMapsUrl       = mapsUrl ? esc(mapsUrl) : "";

        const greetingTitle = isProfessional ? "CONFERENCE ACCESS PASS" : "CORDIAL INVITATION PASS";
        const greetingSub   = isProfessional ? "Official Attendee Badge" : "We are honored by your presence";

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Pass &#x2014; ${safeEventTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,800;1,700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-family: 'Outfit', sans-serif; 
            background-color: #f1f5f9; 
            color: #0f172a; 
            padding: 0; 
            overflow-x: hidden; 
            position: relative;
        }

        /* Ambient Glow Blobs */
        .bg-glow-1 { position: absolute; top: -10%; left: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(251,207,232,0.4) 0%, rgba(251,207,232,0) 70%); filter: blur(80px); pointer-events: none; z-index: 1; }
        .bg-glow-2 { position: absolute; bottom: -10%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(165,243,252,0.4) 0%, rgba(165,243,252,0) 70%); filter: blur(80px); pointer-events: none; z-index: 1; }

        /* Mobile App Frame Mockup (inspired by user reference) */
        .phone-wrapper {
            width: 100%;
            max-width: 440px;
            background: #ffffff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            position: relative;
            z-index: 5;
            padding-bottom: 84px; /* for bottom navbar */
            overflow: hidden;
        }

        @media (min-width: 480px) {
            .phone-wrapper {
                min-height: 850px;
                border-radius: 40px;
                border: 8px solid #0f172a;
                margin: 20px 0;
            }
        }

        /* Mock status bar */
        .status-bar {
            height: 40px;
            padding: 0 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            background: #ffffff;
            z-index: 10;
        }
        .status-icons {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .status-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #0f172a;
        }

        /* App Header */
        .app-header {
            padding: 12px 24px 20px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #f1f5f9;
            background: #ffffff;
        }
        .header-logo {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .header-logo span {
            color: #ec4899;
        }
        .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
            color: #64748b;
        }
        .header-btn {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            position: relative;
        }
        .badge-dot {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 6px;
            height: 6px;
            background: #ec4899;
            border-radius: 50%;
        }

        /* Main Content Viewport */
        .app-content {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex: 1;
            overflow-y: auto;
        }

        /* Physical Badge Card Design (matching reference left side) */
        .physical-badge {
            background: #ffffff;
            border-radius: 28px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 15px 35px rgba(0,0,0,0.06);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
            margin-bottom: 10px;
        }
        
        .badge-notch-top {
            width: 50px;
            height: 10px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            margin: 15px auto -5px auto;
            position: relative;
            z-index: 10;
        }

        .badge-top-section {
            padding: 25px 24px 15px 24px;
            text-align: center;
            background: #ffffff;
            position: relative;
        }

        .badge-event-logo {
            font-size: 11px;
            font-weight: 800;
            color: #94a3b8;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .badge-event-title {
            font-size: 24px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.03em;
            line-height: 1.2;
            margin-bottom: 6px;
        }

        .badge-event-meta {
            font-size: 11px;
            font-weight: 800;
            color: #ec4899;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .badge-tear-line {
            position: relative;
            height: 1px;
            border-top: 2px dashed #e2e8f0;
            margin: 0;
            z-index: 10;
        }
        .badge-tear-line::before {
            content: '';
            position: absolute;
            left: -9px;
            top: -9px;
            width: 18px;
            height: 18px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 50%;
        }
        .badge-tear-line::after {
            content: '';
            position: absolute;
            right: -9px;
            top: -9px;
            width: 18px;
            height: 18px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 50%;
        }

        .badge-bottom-section {
            background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600');
            background-size: cover;
            background-position: center;
            padding: 35px 24px 25px 24px;
            text-align: center;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .badge-attendee-name {
            font-size: 26px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.03em;
            margin-bottom: 6px;
        }

        .badge-attendee-title {
            font-size: 13px;
            font-weight: 800;
            color: #475569;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 25px;
        }

        .badge-slots-bottom {
            display: flex;
            gap: 90px;
            margin-top: 15px;
        }
        .badge-slot-bottom {
            width: 16px;
            height: 8px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
        }

        /* App Cards */
        .app-card {
            background: #ffffff;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-title {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Ticket & Schedule Details */
        .ticket-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
            border-radius: 12px;
            padding: 14px 16px;
            border: 1px solid #f1f5f9;
        }
        .ticket-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .ticket-label {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
        }
        .ticket-val {
            font-size: 14px;
            font-weight: 700;
            color: #334155;
        }

        .schedule-btn {
            background: #ff007f; /* Hot pink accent as seen in the image */
            color: #ffffff;
            border: none;
            padding: 16px 20px;
            border-radius: 14px;
            font-weight: 800;
            font-size: 14px;
            cursor: pointer;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 10px 20px rgba(255, 0, 127, 0.25);
            transition: all 0.2s ease;
        }
        .schedule-btn:hover {
            transform: translateY(-1px);
            background: #e60072;
        }

        /* Interactive Grayscale Google Map */
        .map-wrapper {
            position: relative;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #cbd5e1;
            height: 180px;
        }
        .map-iframe {
            width: 100%;
            height: 100%;
            border: none;
            filter: grayscale(100%) invert(8%) contrast(90%); /* Grayscale theme filter */
        }
        
        .map-btn {
            background: #0f172a;
            color: #ffffff;
            text-decoration: none;
            padding: 14px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 13px;
            text-align: center;
            display: block;
            box-shadow: 0 4px 12px rgba(15,23,42,0.1);
        }

        /* About Section */
        .about-text {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
        }
        .read-more-link {
            color: #0f172a;
            font-weight: 700;
            text-decoration: none;
            margin-top: 5px;
            display: inline-block;
        }

        /* Barcode section */
        .barcode-card {
            text-align: center;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 16px;
            padding: 20px;
        }
        .barcode-lines {
            display: flex;
            gap: 2px;
            height: 48px;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            padding: 6px 16px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            width: 100%;
            margin-bottom: 8px;
        }
        .barcode-line {
            height: 100%;
            background: #0f172a;
        }
        .barcode-code {
            font-family: monospace;
            font-size: 12px;
            font-weight: 800;
            color: #64748b;
            letter-spacing: 0.2em;
            text-transform: uppercase;
        }

        /* Bottom App Bar */
        .bottom-nav {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 72px;
            background: #ffffff;
            border-top: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 0 10px;
            z-index: 100;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: #94a3b8;
            text-decoration: none;
            font-size: 10px;
            font-weight: 700;
            transition: color 0.2s;
            cursor: pointer;
        }
        
        .nav-item.active {
            color: #0f172a;
        }

        .nav-icon {
            font-size: 20px;
        }

        /* Success Status Alert */
        .status-banner {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 100px;
            border: 1px solid ${safeStatusColor}33;
            background: ${safeStatusColor}10;
            color: ${safeStatusColor};
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            align-self: center;
            margin-top: 10px;
        }
        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: ${safeStatusColor};
        }
    </style>
</head>
<body>
    <div class="bg-glow-1"></div>
    <div class="bg-glow-2"></div>

    <div class="phone-wrapper">
        <!-- Mock Status Bar -->
        <div class="status-bar">
            <div>9:41</div>
            <div class="status-icons">
                <div class="status-dot"></div>
                <div style="font-size: 10px;">📶</div>
                <div style="font-size: 10px;">🔋</div>
            </div>
        </div>

        <!-- App Top Header -->
        <div class="app-header">
            <div class="header-logo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="color: #ec4899;"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5s1 4.24 2.5 5.5M19.5 16.5c1.5 1.26 2.5 3.19 2.5 5.5s-1 4.24-2.5 5.5M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-6h2v6zm0-8h-2V7h2v1z"/></svg>
                Planora <span>OS</span>
            </div>
            <div class="header-actions">
                <button class="header-btn">
                    🔔
                    <span class="badge-dot"></span>
                </button>
                <button class="header-btn">
                    💬
                    <span class="badge-dot"></span>
                </button>
            </div>
        </div>

        <!-- Scrollable Page Content -->
        <div class="app-content">
            <!-- Physical Ticket Badge -->
            <div class="physical-badge">
                <div class="badge-notch-top"></div>
                
                <div class="badge-top-section">
                    <div class="badge-event-logo">${safeEventType} BADGE</div>
                    <h2 class="badge-event-title">${safeEventTitle}</h2>
                    <div class="badge-event-meta">${safeEventDate} &bull; ${safeEventCity}</div>
                </div>

                <div class="badge-tear-line"></div>

                <div class="badge-bottom-section">
                    <h3 class="badge-attendee-name">${safeGuestName}</h3>
                    <div class="badge-attendee-title">${safeCategoryName}</div>
                    
                    <!-- Verified Status Pill -->
                    <div class="status-banner">
                        <div class="status-dot"></div>
                        <span>${safeStatusLabel}</span>
                    </div>
                    
                    <div class="badge-slots-bottom">
                        <div class="badge-slot-bottom"></div>
                        <div class="badge-slot-bottom"></div>
                    </div>
                </div>
            </div>

            <!-- About Event Card -->
            <div class="app-card">
                <div class="card-header">
                    <h3 class="card-title">About ${safeEventTitle}</h3>
                </div>
                <div class="about-text">
                    ${safeEventDesc}
                    <br/>
                    <a href="#" class="read-more-link" onclick="event.preventDefault(); alert('Full agenda details available on the event dashboard.');">Read more</a>
                </div>
            </div>

            <!-- Tickets & Add to Schedule Calendar Card -->
            <div class="app-card">
                <div class="card-header">
                    <h3 class="card-title">Your Tickets</h3>
                </div>
                <div class="ticket-row">
                    <div class="ticket-info">
                        <span class="ticket-label">Access Level</span>
                        <span class="ticket-val">${safeGuestCategory} Pass</span>
                    </div>
                    <div class="ticket-info" style="text-align: right;">
                        <span class="ticket-label">Group Size</span>
                        <span class="ticket-val">${safeFamilySize} Person${safeFamilySize > 1 ? 's' : ''}</span>
                    </div>
                </div>
                <button class="schedule-btn" onclick="alert('Event added to your calendar schedule!');">
                    My Schedule
                </button>
            </div>

            <!-- Venue Location Google Maps Card -->
            ${event.location ? `
            <div class="app-card">
                <div class="card-header">
                    <h3 class="card-title">Venue Location</h3>
                </div>
                <div class="map-wrapper">
                    <iframe class="map-iframe" src="https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed"></iframe>
                </div>
                <div style="font-size: 13px; color: #475569; font-weight: 600; line-height: 1.4;">
                    &#x1F4CD; ${safeEventLocation}
                </div>
                <a href="${safeMapsUrl}" class="map-btn" target="_blank" rel="noopener noreferrer">Navigate on Google Maps &#x2192;</a>
            </div>
            ` : ''}

            <!-- Unique Entry Code Scan Card -->
            <div class="app-card barcode-card">
                <div class="barcode-lines">
                    ${[1,3,2,1,4,1,2,3,1,2,1,4,2,1,3,1,2,4,1,2,1,3,1,2,4].map(w => `<div class="barcode-line" style="width: ${w}px;"></div>`).join('')}
                </div>
                <div class="barcode-code">${safeEntryCode}</div>
            </div>
        </div>

        <!-- Bottom Tab App Navigation Mock -->
        <div class="bottom-nav">
            <div class="nav-item active" onclick="alert('Navigating Home...');">
                <div class="nav-icon">🏠</div>
                <div>Home</div>
            </div>
            <div class="nav-item" onclick="alert('Navigating Agenda...');">
                <div class="nav-icon">📅</div>
                <div>Agenda</div>
            </div>
            <div class="nav-item" onclick="alert('Navigating Sponsors...');">
                <div class="nav-icon">🤝</div>
                <div>Sponsors</div>
            </div>
            <div class="nav-item" onclick="alert('Navigating Speakers...');">
                <div class="nav-icon">🎙️</div>
                <div>Speakers</div>
            </div>
            <div class="nav-item" onclick="alert('Opening menu...');">
                <div class="nav-icon">💬</div>
                <div>More</div>
            </div>
        </div>
    </div>
</body>
</html>
        `);
    } catch (error) {
        console.error("[Guest Pass Error]", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
