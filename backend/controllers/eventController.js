import Event from "../models/Event.js";
import Vendor from "../models/Vendor.js";
import Profile from "../models/Profile.js";
import Collaborator from "../models/Collaborator.js";
import { getAllowedEventIds } from "../utils/authHelper.js";
import { handleControllerError } from "../utils/errorHandler.js";

// @desc    Create a new event
// @route   POST /api/events
// @access  Public
export const createEvent = async (req, res) => {
    try {
        const { name, budget, location, city, country, date, userId, type, status, description, banner } = req.body;

        const event = await Event.create({
            title: name,
            description: description || "",
            banner: banner || "",
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
        return handleControllerError(res, error, "Failed to create event. Please try again.");
    }
};

// @desc    Get all events for a specific user (+ shared events)
// @route   GET /api/events?user=userId&email=email
// @access  Public
export const getEvents = async (req, res) => {
    try {
        const userId = req.query.user || req.headers["x-user-id"];
        const userEmail = req.query.email || req.headers["x-user-email"];
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const allowedEventIds = await getAllowedEventIds(userId, userEmail);

        if (userId) {
            const leaderProfile = await Profile.findOne({ user: userId });
            if (leaderProfile && leaderProfile.whatsapp) {
                await Collaborator.updateMany(
                    { user: userId },
                    { $set: { inviterWhatsApp: leaderProfile.whatsapp } }
                );
            }
        }

        const events = await Event.find({ _id: { $in: allowedEventIds } }).sort({ createdAt: -1 });

        const eventIds = events.map(e => e._id);
        const spendings = await Vendor.aggregate([
            { $match: { event: { $in: eventIds } } },
            { $group: { _id: "$event", total: { $sum: "$cost" } } }
        ]);

        const spendMap = spendings.reduce((acc, curr) => {
            acc[curr._id.toString()] = curr.total;
            return acc;
        }, {});

        const formattedEvents = events.map(event => ({
            id: event._id,
            name: event.title,
            description: event.description || "",
            banner: event.banner || "",
            date: event.date,
            location: event.location,
            city: event.city || "Mumbai",
            country: event.country || "India",
            type: event.type || "Other",
            budget: event.budget,
            status: event.status,
            user: event.user,
            spent: spendMap[event._id.toString()] || 0,
            registrationConfig: event.registrationConfig || null
        }));

        res.json(formattedEvents);
    } catch (error) {
        return handleControllerError(res, error, "Failed to retrieve events. Please try again.");
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

        if (userId) {
            const allowedIds = await getAllowedEventIds(userId, userEmail);
            if (!allowedIds.includes(eventId)) {
                return res.status(403).json({ message: "Unauthorized: Access to this operational context is restricted." });
            }
        }

        const formattedEvent = {
            id: event._id,
            name: event.title,
            description: event.description || "",
            banner: event.banner || "",
            date: event.date,
            location: event.location,
            city: event.city || "Mumbai",
            country: event.country || "India",
            type: event.type || "Other",
            budget: event.budget,
            status: event.status,
            user: event.user,
            registrationConfig: event.registrationConfig || null
        };

        res.json(formattedEvent);
    } catch (error) {
        return handleControllerError(res, error, "Failed to retrieve event details. Please try again.");
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
        return handleControllerError(res, error, "Failed to update event. Please try again.");
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
        return handleControllerError(res, error, "Failed to delete event. Please try again.");
    }
};
