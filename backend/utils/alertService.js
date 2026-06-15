import cron from "node-cron";
import Event from "../models/Event.js";
import Guest from "../models/Guest.js";
import Collaborator from "../models/Collaborator.js";
import { sendOneDayAlert } from "./emailService.js";
import { generateGroqCompletion } from "../controllers/aiController.js";

/**
 * AI Smart Alert Engine
 * Checks daily for events starting in 24 hours and sends strategic briefings.
 */
export const initAlertEngine = () => {
    // Run every day at 10:00 AM
    cron.schedule("0 10 * * *", async () => {
        console.log("[AI Alert Engine] Initiating daily scan for upcoming events...");
        await processDailyAlerts();
    });
};

export const processDailyAlerts = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];

        // Find events starting tomorrow
        const events = await Event.find({ date: tomorrowStr });
        console.log(`[AI Alert Engine] Found ${events.length} events starting on ${tomorrowStr}`);

        for (const event of events) {
            await sendSmartAlertsForEvent(event);
        }
    } catch (error) {
        console.error("[AI Alert Engine] Scan Failure:", error);
    }
};

export const sendSmartAlertsForEvent = async (event) => {
    try {
        const guests = await Guest.find({ event: event._id, status: "Confirmed" });
        const collaborators = await Collaborator.find({ event: event._id });

        // 1. Generate AI Personalization
        let guestIntelligence = "We are excited to see you tomorrow! Please arrive 15 minutes early.";
        let teamBriefing = "Final check on all logistics. Ensure all vendor payments are scheduled.";

        if (process.env.GROQ_API_KEY) {
            try {
                const guestPrompt = `Generate a 2-sentence sophisticated welcome note for guests attending a "${event.title}" (${event.type}) tomorrow at "${event.location}". Be welcoming but professional. No emojis.`;
                const teamPrompt = `Generate a 2-sentence tactical briefing for the planning team for "${event.title}" starting tomorrow. Focus on operational readiness and final checks. No emojis.`;
                
                const [gRes, tRes] = await Promise.all([
                    generateGroqCompletion(guestPrompt),
                    generateGroqCompletion(teamPrompt)
                ]);
                
                guestIntelligence = gRes.trim();
                teamBriefing = tRes.trim();
            } catch (err) {
                console.warn("[AI Alert Engine] AI Generation failed, using defaults.");
            }
        }

        // 2. Send to Guests
        for (const guest of guests) {
            await sendOneDayAlert(guest, event, guestIntelligence, "guest");
        }

        // 3. Send to Team
        for (const member of collaborators) {
            await sendOneDayAlert(member, event, teamBriefing, "team");
        }

        console.log(`[AI Alert Engine] Smart alerts dispatched for event: ${event.title}`);
    } catch (error) {
        console.error(`[AI Alert Engine] Alert dispatch failure for ${event.title}:`, error);
    }
};
