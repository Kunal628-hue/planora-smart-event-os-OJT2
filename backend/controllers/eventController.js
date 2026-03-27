import Event from "../models/Event.js";

// @desc    Create a new event
// @route   POST /api/events
// @access  Public
export const createEvent = async (req, res) => {
    try {
        const { name, budget, location, date, userId, type, status } = req.body;

        const event = await Event.create({
            title: name,
            description: "", // Now using a separate field for type
            location,
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

// @desc    Get all events for a specific user
// @route   GET /api/events?user=userId
// @access  Public
export const getEvents = async (req, res) => {
    try {
        const userId = req.query.user;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const filter = { user: userId };

        console.log(`[Backend] Fetching events for user: ${userId}`);
        const events = await Event.find(filter).sort({ createdAt: -1 });

        // Map 'title' back to 'name' and '_id' to 'id' for frontend compatibility
        const formattedEvents = events.map(event => ({
            id: event._id,
            name: event.title,
            date: event.date,
            location: event.location,
            type: event.type || "Other",
            budget: event.budget,
            status: event.status,
            userId: event.user
        }));

        res.json(formattedEvents);
    } catch (error) {
        console.error("[Backend] Error in getEvents:", error);
        res.status(500).json({ message: "Failed to retrieve events. Check database connectivity.", error: error.message });
    }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Format for frontend
        const formattedEvent = {
            id: event._id,
            name: event.title,
            date: event.date,
            location: event.location,
            type: event.type || "Other",
            budget: event.budget,
            status: event.status,
            userId: event.user
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
