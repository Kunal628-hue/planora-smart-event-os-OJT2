import Event from "../models/Event.js";
import Vendor from "../models/Vendor.js";
import Profile from "../models/Profile.js";
import Collaborator from "../models/Collaborator.js";
import { getAllowedEventIds } from "../utils/authHelper.js";

// @desc    Create a new event
// @route   POST /api/events
// @access  Public
export const createEvent = async (req, res) => {
    try {
        const { name, budget, location, city, country, date, userId, type, status } = req.body;

        const event = await Event.create({
            title: name,
            description: "", // Now using a separate field for type
            location,
            city: city || "Mumbai",
            country: country || "India",
            date,
            user: userId,
            budget,
            status: status || "Planned",
            type: type || "Other"
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all events for a specific user (+ shared events)
// @route   GET /api/events?user=userId&email=email
// @access  Public
export const getEvents = async (req, res) => {
    try {
        const { user: userId, email: userEmail } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const allowedEventIds = await getAllowedEventIds(userId, userEmail);

        // --- Strategic Component: Profile & Team Leader Presence Synchronization ---
        // When a Team Leader logs in, we ensure their contact intelligence is propagated to their team.
        if (userId) {
            const leaderProfile = await Profile.findOne({ user: userId });
            if (leaderProfile && leaderProfile.whatsapp) {
                console.log(`[Presence Intelligence] Synchronizing Team Leader contact (${leaderProfile.whatsapp}) across operational pool.`);
                await Collaborator.updateMany(
                    { user: userId },
                    { $set: { inviterWhatsApp: leaderProfile.whatsapp } }
                );
            }
        }

        console.log(`[Backend Access Analytics] User: ${userEmail || userId} | Allowed Scope: [${allowedEventIds.join(', ')}]`);
        const events = await Event.find({ _id: { $in: allowedEventIds } }).sort({ createdAt: -1 });
        console.log(`[Backend Access Analytics] Retrieved ${events.length} events from database.`);

        // Calculate actual spent for each event
        const eventIds = events.map(e => e._id);
        const spendings = await Vendor.aggregate([
            { $match: { event: { $in: eventIds } } },
            { $group: { _id: "$event", total: { $sum: "$cost" } } }
        ]);

        const spendMap = spendings.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr.total;
            return acc;
        }, {});

        // Map 'title' back to 'name' and '_id' to 'id' for frontend compatibility
        const formattedEvents = events.map(event => ({
            id: event._id,
            name: event.title,
            date: event.date,
            location: event.location,
            city: event.city || "Mumbai",
            country: event.country || "India",
            type: event.type || "Other",
            budget: event.budget,
            status: event.status,
            user: event.user,
            spent: spendMap[event._id.toString()] || 0
        }));

        res.json(formattedEvents);
        console.log(`[Backend Data Transmission] Sent ${formattedEvents.length} formatted events to client.`);
    } catch (error) {
        console.error("[Backend] Error in getEvents:", error);
        res.status(500).json({ message: "Failed to retrieve events. Check database connectivity.", error: error.message });
    }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id?user=userId&email=email
// @access  Public
export const getEventById = async (req, res) => {
    try {
        const { user: userId, email: userEmail } = req.query;
        const eventId = req.params.id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // --- Strategic Access Verification ---
        // We verify that the requesting entity has been granted operational visibility into this context.
        if (userId) {
            const allowedIds = await getAllowedEventIds(userId, userEmail);
            if (!allowedIds.includes(eventId)) {
                console.warn(`[Security Alert] Unauthorized access attempt by ${userEmail || userId} on event ${eventId}`);
                return res.status(403).json({ message: "Unauthorized: Access to this operational context is restricted." });
            }
        }

        // Format for frontend
        const formattedEvent = {
            id: event._id,
            name: event.title,
            date: event.date,
            location: event.location,
            city: event.city || "Mumbai",
            country: event.country || "India",
            type: event.type || "Other",
            budget: event.budget,
            status: event.status,
            user: event.user
        };

        res.json(formattedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an event
// @route   PATCH /api/events/:id
// @access  Public
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Public
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        await event.deleteOne();
        res.json({ message: "Event removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
