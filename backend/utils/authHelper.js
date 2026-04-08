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
    // 1. Find all events owned by this user
    const ownedEvents = await Event.find({ user: userId }, "_id");
    let allowedIds = ownedEvents.map(e => e._id.toString());

    // 2. Find events where this user (by email) is a specifically invited collaborator
    if (email) {
        const collaborations = await Collaborator.find({ email: email });
        const sharedIds = collaborations
            .map(c => c.event?.toString())
            .filter(id => id && id !== "undefined");
        
        allowedIds = [...new Set([...allowedIds, ...sharedIds])];
    }

    return allowedIds;
};
