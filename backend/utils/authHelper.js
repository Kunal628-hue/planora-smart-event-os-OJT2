import Collaborator from "../models/Collaborator.js";
import Event from "../models/Event.js";

/**
 * Returns all event IDs the current user should have access to.
 * This includes events they own AND events specifically shared with them.
 * @param {string} userId - The current logged-in user's UID.
 * @param {string} email - The current logged-in user's email.
 * @returns {Promise<string[]>} - Array of event ObjectIDs as strings.
 */
export const getAllowedEventIds = async (userId, email) => {
    // 1. Check for Super Admin (Dynamic via Environment Context)
    // Granting unrestricted access to the designated administrative authority.
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (email && email === adminEmail) {
        console.log(`[Auth Intelligence] Administrative oversight detected: ${email}. Synchronizing full tactical grid.`);
        const allEvents = await Event.find({}, "_id");
        return allEvents.map(e => e._id.toString());
    }

    // 2. Find all events owned by this user
    const ownedEvents = await Event.find({ user: userId }, "_id");
    let allowedIds = ownedEvents.map(e => e._id.toString());

    // 3. Find events where this user (by email) is a specifically invited collaborator
    // This allows team members invited by the Team Leader to access specific operational contexts.
    if (email) {
        const collaborations = await Collaborator.find({ email: { $regex: new RegExp(`^${email}$`, "i") } });
        const sharedIds = collaborations
            .map(c => c.event?.toString())
            .filter(id => id && id !== "undefined");
        
        allowedIds = [...new Set([...allowedIds, ...sharedIds])];
    }

    return allowedIds;
};
